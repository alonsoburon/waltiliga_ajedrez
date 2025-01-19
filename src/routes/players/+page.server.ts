// src/routes/players/+page.server.ts
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

	const divisions = await db.query.divisions.findMany();

	return {
		players,
		divisions
	};
};
