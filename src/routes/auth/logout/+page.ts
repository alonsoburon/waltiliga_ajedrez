// src/routes/auth/logout/+page.ts
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	throw redirect(303, '/auth/login');
};
