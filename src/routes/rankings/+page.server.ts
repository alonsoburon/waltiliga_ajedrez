// src/routes/rankings/+page.server.ts
import { db } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const players = await db.query.players.findMany({
		with: {
			division: true,
			gamesAsWhite: {
				columns: {
					result: true
				},
				relationName: 'playerWhiteGames'
			},
			gamesAsBlack: {
				columns: {
					result: true
				},
				relationName: 'playerBlackGames'
			}
		}
	});

	// Calcular ranking
	const rankings = players
		.map((player) => {
			const wins =
				player.gamesAsWhite.filter((g) => g.result === 1).length +
				player.gamesAsBlack.filter((g) => g.result === -1).length;
			const draws =
				player.gamesAsWhite.filter((g) => g.result === 0).length +
				player.gamesAsBlack.filter((g) => g.result === 0).length;
			const totalGames = player.gamesAsWhite.length + player.gamesAsBlack.length;
			const losses = totalGames - wins - draws;

			return {
				...player,
				stats: {
					games: totalGames,
					wins,
					draws,
					losses,
					points: wins * 3 + draws
				}
			};
		})
		.sort((a, b) => b.stats.points - a.stats.points);

	const divisions = await db.query.divisions.findMany();

	return {
		rankings,
		divisions
	};
};
