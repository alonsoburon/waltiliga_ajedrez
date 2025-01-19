// routes/games/+page.server.ts
import { db } from '$lib/server/db';
import { games, players, seasons } from '$lib/server/db/schema';
import { desc, eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const allGames = await db.query.games.findMany({
		with: {
			whitePlayer: true,
			blackPlayer: true,
			season: true
		},
		orderBy: [desc(games.playedAt)]
	});

	const allPlayers = await db.query.players.findMany({
		with: {
			division: true
		}
	});

	const currentSeason = await db.query.seasons.findFirst({
		where: eq(seasons.active, true)
	});

	return {
		games: allGames,
		players: allPlayers,
		currentSeason
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
