// routes/players/[id]/+page.server.ts
import { db } from '$lib/server/db';
import { games, players, seasons } from '$lib/server/db/schema';
import { eq, or, desc } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	console.log('🔄 Loading player data...', params.id);

	const playerId = parseInt(params.id);

	const [player, allPlayers, allGames, allSeasons] = await Promise.all([
		// Obtener el jugador con su división
		db.query.players.findFirst({
			where: eq(players.id, playerId),
			with: {
				division: true
			}
		}),
		// Obtener todos los jugadores
		db.query.players.findMany({
			with: {
				division: true
			}
		}),
		// Obtener todos los juegos
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

	if (!player) {
		console.error('❌ Player not found:', playerId);
		throw error(404, 'Jugador no encontrado');
	}

	// Filtrar los juegos del jugador
	const playerGames = allGames.filter(
		(game) => game.whiteId === playerId || game.blackId === playerId
	);

	console.log('📊 Data loaded:', {
		playerName: player.name,
		totalGames: allGames.length,
		playerGames: playerGames.length,
		seasons: allSeasons.length
	});

	return {
		player,
		games: allGames,
		players: allPlayers,
		playerGames,
		seasons: allSeasons
	};
};
