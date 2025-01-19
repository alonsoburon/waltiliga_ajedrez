// src/routes/admin/+layout.server.ts
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	if (!locals.auth.user?.isAdmin) {
		// Cambiar a la ruta correcta
		throw redirect(303, '/auth/login');
	}

	return {
		user: locals.auth.user
	};
};
