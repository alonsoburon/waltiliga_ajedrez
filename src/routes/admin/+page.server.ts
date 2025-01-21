// routes/admin/+page.server.ts
import { db } from '$lib/server/db';
import { players, divisions, games, seasons } from '$lib/server/db/schema';
import { desc, eq } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';

export const load = (async ({ locals }) => {
	// Verificar que el usuario sea administrador
	if (!locals?.auth?.user?.isAdmin) {
		throw redirect(302, '/');
	}

	// Cargar todos los datos necesarios para los stores
	const [allPlayers, allDivisions, allGames, allSeasons] = await Promise.all([
		// Jugadores con sus divisiones
		db.query.players.findMany({
			with: {
				division: true
			},
			orderBy: [desc(players.startingElo)]
		}),

		// Divisiones ordenadas por rango
		db.query.divisions.findMany({
			orderBy: [desc(divisions.rank)]
		}),

		// Juegos con toda la información necesaria
		db.query.games.findMany({
			with: {
				whitePlayer: true,
				blackPlayer: true,
				season: true
			},
			orderBy: [desc(games.playedAt)]
		}),

		// Temporadas ordenadas por fecha
		db.query.seasons.findMany({
			orderBy: [desc(seasons.startDate)]
		})
	]);

	return {
		players: allPlayers,
		divisions: allDivisions,
		games: allGames,
		seasons: allSeasons
	};
}) satisfies PageServerLoad;

export const actions = {
	// Actualizar un jugador
	updatePlayer: async ({ request }) => {
		const formData = await request.formData();
		const playerId = parseInt(formData.get('id') as string);
		const active = formData.get('active') === 'true';
		const divisionId = parseInt(formData.get('divisionId') as string);

		if (!playerId) {
			return fail(400, { error: 'ID de jugador inválido' });
		}

		try {
			const [updatedPlayer] = await db
				.update(players)
				.set({
					active,
					divisionId
				})
				.where(eq(players.id, playerId))
				.returning();

			return { success: true, player: updatedPlayer };
		} catch (error) {
			console.error('Error actualizando jugador:', error);
			return fail(500, { error: 'Error actualizando jugador' });
		}
	},

	// Crear nueva temporada
	createSeason: async ({ request }) => {
		const formData = await request.formData();
		const name = formData.get('name') as string;
		const description = formData.get('description') as string;
		const startDate = new Date(formData.get('startDate') as string);
		const endDate = new Date(formData.get('endDate') as string);

		try {
			// Desactivar temporada actual si existe
			await db.update(seasons).set({ active: false }).where(eq(seasons.active, true));

			// Crear nueva temporada
			const [newSeason] = await db
				.insert(seasons)
				.values({
					name,
					description,
					startDate,
					endDate,
					active: true
				})
				.returning();

			return { success: true, season: newSeason };
		} catch (error) {
			console.error('Error creando temporada:', error);
			return fail(500, { error: 'Error creando temporada' });
		}
	},

	// Actualizar división
	updateDivision: async ({ request }) => {
		const formData = await request.formData();
		const divisionId = parseInt(formData.get('id') as string);
		const name = formData.get('name') as string;
		const rank = parseInt(formData.get('rank') as string);

		if (!divisionId) {
			return fail(400, { error: 'ID de división inválido' });
		}

		try {
			const [updatedDivision] = await db
				.update(divisions)
				.set({
					name,
					rank
				})
				.where(eq(divisions.id, divisionId))
				.returning();

			return { success: true, division: updatedDivision };
		} catch (error) {
			console.error('Error actualizando división:', error);
			return fail(500, { error: 'Error actualizando división' });
		}
	}
} satisfies Actions;
