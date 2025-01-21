// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { session, user } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const handle: Handle = async ({ event, resolve }) => {
	const path = event.url.pathname;
	const sessionId = event.cookies.get('auth_session');

	// Inicializar auth por defecto
	event.locals.auth = { user: null, session: null };

	if (sessionId) {
		try {
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

			if (result && result.session.activeExpires >= BigInt(Date.now())) {
				event.locals.auth = {
					user: result.user,
					session: result.session
				};
			} else if (result) {
				await db.delete(session).where(eq(session.id, sessionId));
			}
		} catch (error) {
			console.error('[AUTH] Session error:', error);
		}
	}

	// Debug
	console.log('[AUTH] Locals:', {
		path,
		auth: event.locals.auth,
		sessionId: sessionId ? 'exists' : 'none'
	});

	// Solo log de página si no es un asset
	if (!path.includes('.')) {
		console.log('[PAGE]', path, event.locals.auth.user?.username || 'anonymous');
	}

	return await resolve(event);
};
