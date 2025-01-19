// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { session, user } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const handle: Handle = async ({ event, resolve }) => {
	console.log('[DEBUG] Processing request:', event.url.pathname);

	const sessionId = event.cookies.get('auth_session');
	console.log('[DEBUG] Session ID:', sessionId);

	if (!sessionId) {
		event.locals.auth = {
			user: null,
			session: null
		};
		return await resolve(event);
	}

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

		if (!result) {
			event.locals.auth = {
				user: null,
				session: null
			};
			return await resolve(event);
		}

		// Verificar expiración
		if (result.session.activeExpires < BigInt(Date.now())) {
			await db.delete(session).where(eq(session.id, sessionId));
			event.locals.auth = {
				user: null,
				session: null
			};
			return await resolve(event);
		}

		event.locals.auth = {
			user: result.user,
			session: result.session
		};
	} catch (error) {
		console.error('[DEBUG] Error in hook:', error);
		event.locals.auth = {
			user: null,
			session: null
		};
	}

	return await resolve(event);
};
