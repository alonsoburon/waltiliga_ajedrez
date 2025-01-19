// src/routes/auth/logout/+page.server.ts
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { session } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { Actions } from './$types';

export const actions = {
	default: async ({ cookies, locals }) => {
		const sessionId = cookies.get('auth_session');
		const username = locals.auth.user?.username;

		try {
			if (sessionId) {
				await db.delete(session).where(eq(session.id, sessionId));

				cookies.delete('auth_session', { path: '/' });
				console.log('[AUTH] Logout successful:', { username });
			}

			// No necesitamos loggear nada más después de esto
			locals.auth = { user: null, session: null };
			throw redirect(303, '/auth/login');
		} catch (error) {
			// Solo loggear errores que no sean redirecciones
			if (!(error instanceof redirect)) {
				console.error('[AUTH] Logout error:', {
					username,
					error: error instanceof Error ? error.message : 'Unknown error'
				});
			}
			throw error;
		}
	}
} satisfies Actions;

// Opcional: para prevenir acceso directo a /auth/logout
export const load = async () => {
	throw redirect(303, '/');
};
