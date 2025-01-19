// routes/players/+page.server.ts
import { db } from '$lib/server/db';
import { players, games, divisions } from '$lib/server/db/schema';
import { desc, asc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const allPlayers = await db.query.players.findMany({
		with: {
			division: true
		}
	});

	const allGames = await db.query.games.findMany({
		with: {
			whitePlayer: true,
			blackPlayer: true,
			season: true
		},
		orderBy: [desc(games.playedAt)]
	});

	const allDivisions = await db.query.divisions.findMany({
		orderBy: [asc(divisions.rank)]
	});

	return {
		players: allPlayers,
		games: allGames,
		divisions: allDivisions
	};
};
