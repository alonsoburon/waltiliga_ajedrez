// routes/rankings/+page.server.ts
import { db } from '$lib/server/db';
import { players, divisions, games, seasons } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';
import { desc } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
	const [allDivisions, allPlayers, allGames, allSeasons] = await Promise.all([
		// Obtener todas las divisiones
		db.query.divisions.findMany({
			orderBy: [desc(divisions.rank)]
		}),

		// Obtener todos los jugadores con sus divisiones
		db.query.players.findMany({
			with: {
				division: true
			}
		}),

		// Obtener todos los juegos para calcular estadísticas
		db.query.games.findMany({
			with: {
				whitePlayer: true,
				blackPlayer: true,
				season: true
			},
			orderBy: [desc(games.playedAt)]
		}),

		// Obtener todas las temporadas
		db.query.seasons.findMany({
			orderBy: [desc(seasons.startDate)]
		})
	]);

	return {
		divisions: allDivisions,
		players: allPlayers,
		games: allGames,
		seasons: allSeasons
	};
};
