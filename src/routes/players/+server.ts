// src/routes/players/+server.ts
import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { players } from '$lib/server/db/schema';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const allPlayers = await db.query.players.findMany({
			with: {
				division: true,
				gamesAsWhite: true,
				gamesAsBlack: true
			}
		});

		// Calcular estadísticas básicas
		const playersWithStats = allPlayers.map((player) => {
			const totalGames = player.gamesAsWhite.length + player.gamesAsBlack.length;
			const stats = {
				games: totalGames,
				wins:
					player.gamesAsWhite.filter((g) => g.result === 1).length +
					player.gamesAsBlack.filter((g) => g.result === -1).length,
				draws:
					player.gamesAsWhite.filter((g) => g.result === 0).length +
					player.gamesAsBlack.filter((g) => g.result === 0).length
			};

			return {
				...player,
				stats
			};
		});

		return json(playersWithStats);
	} catch (error) {
		return json({ error: 'Error fetching players' }, { status: 500 });
	}
};
