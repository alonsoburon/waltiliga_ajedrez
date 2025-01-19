// src/routes/admin/seasons/+page.server.ts
import { db } from '$lib/server/db';
import { seasons } from '$lib/server/db/schema';
import type { PageServerLoad, Actions } from './$types';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
	const allSeasons = await db.query.seasons.findMany({
		orderBy: (seasons, { desc }) => [desc(seasons.startDate)]
	});

	return { seasons: allSeasons };
};

export const actions = {
	create: async ({ request }) => {
		const data = await request.formData();

		const newSeason = await db
			.insert(seasons)
			.values({
				name: data.get('name') as string,
				description: data.get('description') as string,
				startDate: new Date(data.get('startDate') as string),
				endDate: new Date(data.get('endDate') as string),
				active: true
			})
			.returning();

		return { success: true, season: newSeason[0] };
	},

	toggleActive: async ({ request }) => {
		const data = await request.formData();
		const id = Number(data.get('id'));
		const active = data.get('active') === 'true';

		await db.update(seasons).set({ active }).where(eq(seasons.id, id));

		return { success: true };
	}
} satisfies Actions;
