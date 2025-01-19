// src/routes/admin/+layout.server.ts
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	if (!locals.auth.user) {
		throw redirect(303, '/auth/login');
	}

	if (!locals.auth.user.isAdmin) {
		throw redirect(303, '/');
	}

	return {
		user: locals.auth.user
	};
};
