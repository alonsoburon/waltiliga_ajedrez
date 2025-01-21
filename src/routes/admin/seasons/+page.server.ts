// src/routes/admin/seasons/+page.server.ts
import { db } from '$lib/server/db';
import { seasons } from '$lib/server/db/schema';
import type { PageServerLoad, Actions } from './$types';
import { eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	const allSeasons = await db.query.seasons.findMany({
		orderBy: (seasons, { desc }) => [desc(seasons.startDate)]
	});

	return { seasons: allSeasons };
};

export const actions = {
	create: async ({ request }) => {
		const data = await request.formData();

		// Desactivar temporada actual si existe
		await db.update(seasons).set({ active: false }).where(eq(seasons.active, true));

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

	update: async ({ request }) => {
		try {
			const data = await request.formData();
			const id = data.get('id');
			const name = data.get('name');
			const description = data.get('description');
			const startDate = data.get('startDate');
			const endDate = data.get('endDate');

			if (!id || !name || !description || !startDate || !endDate) {
				return fail(400, {
					error: 'Todos los campos son requeridos'
				});
			}

			const updatedSeason = await db
				.update(seasons)
				.set({
					name: name.toString(),
					description: description.toString(),
					startDate: new Date(startDate.toString()),
					endDate: new Date(endDate.toString())
				})
				.where(eq(seasons.id, parseInt(id.toString())))
				.returning();

			return {
				success: true,
				season: updatedSeason[0]
			};
		} catch (error) {
			console.error('Error updating season:', error);
			return fail(500, {
				error: 'Error al actualizar la temporada'
			});
		}
	},

	toggleActive: async ({ request }) => {
		const data = await request.formData();
		const id = Number(data.get('id'));
		const active = data.get('active') === 'true';

		if (active) {
			// Si vamos a activar una temporada, desactivar la actual primero
			await db.update(seasons).set({ active: false }).where(eq(seasons.active, true));
		}

		await db.update(seasons).set({ active }).where(eq(seasons.id, id));

		return { success: true };
	}
} satisfies Actions;
