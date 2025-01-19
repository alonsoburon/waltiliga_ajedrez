// routes/admin/players/+page.server.ts
import { db } from '$lib/server/db';
import { players, divisions, games } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const load: PageServerLoad = async () => {
	const [allPlayers, allDivisions, allGames] = await Promise.all([
		db.select().from(players),
		db.select().from(divisions),
		db.select().from(games)
	]);

	return {
		players: allPlayers,
		divisions: allDivisions,
		games: allGames
	};
};

export const actions: Actions = {
	add: async ({ request }) => {
		const data = await request.formData();
		try {
			await db.insert(players).values({
				name: data.get('name') as string,
				startingElo: parseInt(data.get('startingElo') as string),
				divisionId: parseInt(data.get('divisionId') as string),
				active: data.get('active') === 'on'
			});
			return { success: true };
		} catch (error) {
			return fail(400, { error: 'Error al crear el jugador' });
		}
	},

	update: async ({ request }) => {
		const data = await request.formData();
		try {
			await db
				.update(players)
				.set({
					name: data.get('name') as string,
					startingElo: parseInt(data.get('startingElo') as string),
					divisionId: parseInt(data.get('divisionId') as string),
					active: data.get('active') === 'on'
				})
				.where(eq(players.id, parseInt(data.get('id') as string)));
			return { success: true };
		} catch (error) {
			return fail(400, { error: 'Error al actualizar el jugador' });
		}
	},

	delete: async ({ request }) => {
		const data = await request.formData();
		try {
			await db.delete(players).where(eq(players.id, parseInt(data.get('id') as string)));
			return { success: true };
		} catch (error) {
			return fail(400, { error: 'Error al eliminar el jugador' });
		}
	}
};
