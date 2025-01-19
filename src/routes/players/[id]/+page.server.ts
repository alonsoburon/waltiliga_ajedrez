// routes/players/[id]/+page.server.ts
import { db } from '$lib/server/db';
import { players, games } from '$lib/server/db/schema';
import { eq, or, desc } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const playerId = parseInt(params.id);

	// Obtener el jugador con su división
	const player = await db.query.players.findFirst({
		where: eq(players.id, playerId),
		with: {
			division: true
		}
	});

	if (!player) {
		throw error(404, 'Jugador no encontrado');
	}

	// Obtener los juegos del jugador
	const playerGames = await db.query.games.findMany({
		where: or(eq(games.whiteId, playerId), eq(games.blackId, playerId)),
		with: {
			whitePlayer: true,
			blackPlayer: true,
			season: true
		},
		orderBy: [desc(games.playedAt)]
	});

	return {
		player,
		games: playerGames
	};
};
