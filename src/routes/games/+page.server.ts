// src/routes/games/+page.server.ts
import { db } from '$lib/server/db';
import type { PageServerLoad } from './$types';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
	const games = await db.query.games.findMany({
		with: {
			whitePlayer: true,
			blackPlayer: true,
			creator: true,
			season: true
		},
		orderBy: (games, { desc }) => [desc(games.playedAt)] // Mantener orden descendente
	});

	const players = await db.query.players.findMany({
		where: (players, { eq }) => eq(players.active, true)
	});

	const seasons = await db.query.seasons.findMany({
		orderBy: (seasons, { desc }) => [desc(seasons.startDate)]
	});

	return {
		games,
		players,
		seasons,
		currentSeason: seasons.find((s) => s.active)
	};
};

// Opcional: Si quieres manejar la creación de partidas en el servidor
import { fail } from '@sveltejs/kit';
import { games } from '$lib/server/db/schema';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();

		const whiteId = parseInt(formData.get('whiteId') as string);
		const blackId = parseInt(formData.get('blackId') as string);
		const result = parseInt(formData.get('result') as string);
		const seasonId = parseInt(formData.get('seasonId') as string);
		const cond1 = formData.has('cond1');

		// Validaciones
		if (whiteId === blackId) {
			return fail(400, { error: 'Un jugador no puede jugar contra sí mismo' });
		}

		if (![1, 0, -1].includes(result)) {
			return fail(400, { error: 'Resultado inválido' });
		}

		try {
			await db.insert(games).values({
				whiteId,
				blackId,
				result,
				seasonId,
				playedAt: new Date(),
				week: 1, // Podríamos calcular la semana basada en la fecha
				createdBy: 'system', // O pasar el usuario actual
				cond1,
				cond2: false,
				cond3: false,
				cond4: false,
				cond5: false
			});

			return { success: true };
		} catch (error) {
			return fail(500, { error: 'Error al crear la partida' });
		}
	}
};
