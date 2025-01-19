// src/routes/+layout.server.ts
import type { LayoutServerLoad } from './$types';

export const load = (async ({ locals }) => {
	return {
		user: locals.auth?.user
			? {
					id: locals.auth.user.id,
					username: locals.auth.user.username,
					isAdmin: locals.auth.user.isAdmin
				}
			: null
	};
}) satisfies LayoutServerLoad;
