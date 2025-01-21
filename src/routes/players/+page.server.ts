// routes/players/+page.server.ts
import { db } from '$lib/server/db';
import { players, games, divisions } from '$lib/server/db/schema';
import { desc, asc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	console.log('🔄 Loading players data...');

	const [allPlayers, allGames, allDivisions] = await Promise.all([
		db.query.players.findMany({
			with: {
				division: true
			}
		}),
		db.query.games.findMany({
			with: {
				whitePlayer: true,
				blackPlayer: true,
				season: true
			},
			orderBy: [desc(games.playedAt)]
		}),
		db.query.divisions.findMany({
			orderBy: [asc(divisions.rank)]
		})
	]);

	console.log('📊 Data loaded:', {
		players: allPlayers.length,
		games: allGames.length,
		divisions: allDivisions.length
	});

	return {
		players: allPlayers,
		games: allGames,
		divisions: allDivisions
	};
};
