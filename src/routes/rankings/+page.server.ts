// routes/rankings/+page.server.ts
import { db } from '$lib/server/db';
import { players, divisions, games } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';
import { desc, eq } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
	// Obtener todas las divisiones
	const allDivisions = await db.query.divisions.findMany({
		orderBy: [desc(divisions.rank)]
	});

	// Obtener todos los jugadores activos con sus divisiones
	const allPlayers = await db.query.players.findMany({
		where: eq(players.active, true),
		with: {
			division: true
		}
	});

	// Obtener todos los juegos para calcular ELO
	const allGames = await db.query.games.findMany({
		with: {
			whitePlayer: true,
			blackPlayer: true,
			season: true
		},
		orderBy: [desc(games.playedAt)]
	});

	return {
		divisions: allDivisions,
		players: allPlayers,
		games: allGames
	};
};
