// routes/calendar/+server.ts
import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { weeklyPairings, players, games } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.auth?.user?.isAdmin) {
		return new Response('No autorizado', { status: 401 });
	}

	try {
		const { seasonId, week } = await request.json();

		// Primero, eliminar los pairings de la semana actual
		await db
			.delete(weeklyPairings)
			.where(and(eq(weeklyPairings.seasonId, seasonId), eq(weeklyPairings.week, week)));

		// Obtener jugadores activos
		const activePlayers = await db.select().from(players).where(eq(players.active, true));

		// Obtener historial de juegos de la temporada para balance de colores
		const seasonGames = await db.select().from(games).where(eq(games.seasonId, seasonId));

		// Calcular balance de colores por jugador
		const colorBalance = new Map<number, number>();
		activePlayers.forEach((p) => colorBalance.set(p.id, 0));
		seasonGames.forEach((game) => {
			colorBalance.set(game.whiteId, (colorBalance.get(game.whiteId) || 0) + 1);
			colorBalance.set(game.blackId, (colorBalance.get(game.blackId) || 0) - 1);
		});

		// Generar nuevos emparejamientos
		const pairings = [];
		const availablePlayers = [...activePlayers];
		const playerGames = new Map<number, number>();

		while (availablePlayers.length >= 2) {
			// Ordenar jugadores por startingElo para emparejar similares
			availablePlayers.sort((a, b) => (a.startingElo || 0) - (b.startingElo || 0));

			const player1 = availablePlayers[0];
			let bestOpponentIndex = 1;

			// Buscar el mejor oponente considerando ELO similar
			for (let i = 1; i < Math.min(4, availablePlayers.length); i++) {
				if (
					Math.abs((availablePlayers[i].startingElo || 0) - (player1.startingElo || 0)) <
					Math.abs(
						(availablePlayers[bestOpponentIndex].startingElo || 0) - (player1.startingElo || 0)
					)
				) {
					bestOpponentIndex = i;
				}
			}

			const player2 = availablePlayers[bestOpponentIndex];

			// Determinar colores basado en el balance histórico
			const p1Balance = colorBalance.get(player1.id) || 0;
			const p2Balance = colorBalance.get(player2.id) || 0;
			const [white, black] = p1Balance <= p2Balance ? [player1, player2] : [player2, player1];

			pairings.push({
				whiteId: white.id,
				blackId: black.id,
				week,
				seasonId,
				status: 0
			});

			// Actualizar contadores
			playerGames.set(player1.id, (playerGames.get(player1.id) || 0) + 1);
			playerGames.set(player2.id, (playerGames.get(player2.id) || 0) + 1);

			// Remover jugadores que alcanzaron el máximo de juegos
			availablePlayers.splice(bestOpponentIndex, 1);
			availablePlayers.splice(0, 1);
		}

		// Insertar nuevos emparejamientos
		if (pairings.length > 0) {
			await db.insert(weeklyPairings).values(pairings);
		}

		return json({ success: true, pairings });
	} catch (error) {
		console.error('Error:', error);
		return new Response(error instanceof Error ? error.message : 'Error desconocido', {
			status: 500
		});
	}
};
