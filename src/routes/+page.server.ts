// src/routes/+page.server.ts
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals }) => {
	console.log('[DEBUG] Home page load, auth:', locals.auth);

	// Si no hay sesión, redirigir al login
	if (!locals.auth?.user) {
		throw redirect(302, '/auth/login');
	}

	// Si hay sesión, retornar los datos del usuario
	return {
		user: locals.auth.user
	};
}) satisfies PageServerLoad;
