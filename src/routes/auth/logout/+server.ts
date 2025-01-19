import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { session } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies, locals }) => {
	console.log('[DEBUG] Processing logout request');

	try {
		const sessionId = cookies.get('auth_session');

		if (sessionId) {
			console.log('[DEBUG] Deleting session:', sessionId);
			// Eliminar la sesión de la base de datos
			await db.delete(session).where(eq(session.id, sessionId));

			// Eliminar la cookie
			cookies.delete('auth_session', { path: '/' });
			console.log('[DEBUG] Session deleted successfully');
		}

		// Limpiar el objeto auth en locals
		locals.auth = {
			user: null,
			session: null
		};

		return new Response(null, {
			status: 303,
			headers: { Location: '/auth/login' }
		});
	} catch (error) {
		console.error('[DEBUG] Error during logout:', error);
		throw error;
	}
};
