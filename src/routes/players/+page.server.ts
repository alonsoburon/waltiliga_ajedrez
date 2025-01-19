// routes/players/+page.server.ts
import { db } from '$lib/server/db';
import { players, divisions, games } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const allPlayers = await db.query.players.findMany({
		with: {
			division: true
		}
	});

	const allGames = await db.query.games.findMany();
	const allDivisions = await db.query.divisions.findMany();

	return {
		players: allPlayers,
		games: allGames,
		divisions: allDivisions
	};
};
