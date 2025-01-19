// src/routes/admin/games/+page.server.ts
import { db } from '$lib/server/db';
import { games, players, seasons } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [allGames, allPlayers, allSeasons] = await Promise.all([
		// Consultas simples para cada tabla
		db.select().from(games),
		db.select().from(players),
		db.select().from(seasons)
	]);

	console.log('[DEBUG] Games:', allGames);
	console.log('[DEBUG] Players:', allPlayers);
	console.log('[DEBUG] Seasons:', allSeasons);

	return {
		games: allGames,
		players: allPlayers,
		seasons: allSeasons
	};
};
