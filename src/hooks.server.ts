// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { session, user } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	console.log('[DEBUG] Processing request:', event.url.pathname);

	const sessionId = event.cookies.get('auth_session');
	console.log('[DEBUG] Session ID:', sessionId);

	if (!sessionId) {
		event.locals.auth = {
			user: null,
			session: null
		};
	} else {
		try {
			// Buscar sesión y usuario
			const [result] = await db
				.select({
					session: session,
					user: {
						id: user.id,
						username: user.username,
						isAdmin: user.isAdmin
					}
				})
				.from(session)
				.innerJoin(user, eq(session.userId, user.id))
				.where(eq(session.id, sessionId));

			console.log('[DEBUG] DB Result:', result);

			if (result && result.session.activeExpires >= BigInt(Date.now())) {
				event.locals.auth = {
					user: result.user,
					session: result.session
				};
			} else {
				event.locals.auth = {
					user: null,
					session: null
				};
				if (result) {
					await db.delete(session).where(eq(session.id, sessionId));
				}
			}
		} catch (error) {
			console.error('[DEBUG] Error in hook:', error);
			event.locals.auth = {
				user: null,
				session: null
			};
		}
	}

	// Proteger rutas admin
	if (event.url.pathname.startsWith('/admin')) {
		console.log('[DEBUG] Checking admin access:', event.locals.auth.user);
		if (!event.locals.auth.user) {
			throw redirect(303, '/auth/login');
		}
		if (!event.locals.auth.user.isAdmin) {
			throw redirect(303, '/');
		}
		console.log('[DEBUG] Admin access granted');
	}

	const response = await resolve(event);
	return response;
};
