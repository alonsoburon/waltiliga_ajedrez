// src/routes/admin/divisions/+page.server.ts
import { db } from '$lib/server/db';
import { divisions } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// Usar select simple en lugar de query
	const allDivisions = await db.select().from(divisions);
	console.log('[DEBUG] Divisions:', allDivisions);

	return {
		divisions: allDivisions
	};
};
