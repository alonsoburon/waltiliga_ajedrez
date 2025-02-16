// routes/api/games/+server.ts
import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { weeklyPairings, players, games, seasons } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import type { RequestHandler } from './$types';
import { validateGame, getSeasonWeek } from '$lib/utils/game';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.auth?.user) {
		return new Response('No autorizado', { status: 401 });
	}

	try {
		const formData = await request.formData();
		console.log('Raw form data:', Object.fromEntries(formData));

		// Verificar campos requeridos
		const seasonId = parseInt(formData.get('seasonId') as string);
		const whiteId = parseInt(formData.get('whiteId') as string);
		const blackId = parseInt(formData.get('blackId') as string);
		const result = parseInt(formData.get('result') as string);
		const pairingId = formData.get('pairingId')
			? parseInt(formData.get('pairingId') as string)
			: null;
		const createdBy = locals.auth.user.id;

		if (isNaN(seasonId) || isNaN(whiteId) || isNaN(blackId) || isNaN(result)) {
			return json({ success: false, error: 'Datos inválidos' }, { status: 400 });
		}

		// Validar el juego
		const gameData = {
			whiteId,
			blackId,
			result,
			seasonId,
			playedAt: new Date(),
			cond1: formData.has('cond1'),
			createdBy
		};

		const errors = validateGame(gameData);
		if (errors.length > 0) {
			return json({ success: false, error: errors.join(', ') }, { status: 400 });
		}

		// Obtener la temporada para calcular la semana
		const [season] = await db.select().from(seasons).where(eq(seasons.id, seasonId)).limit(1);

		if (!season) {
			return json({ success: false, error: 'Temporada no encontrada' }, { status: 400 });
		}

		const week = getSeasonWeek(gameData.playedAt, new Date(season.startDate));

		// Crear el juego
		const [newGame] = await db
			.insert(games)
			.values({
				seasonId,
				whiteId,
				blackId,
				result,
				playedAt: gameData.playedAt,
				week,
				createdBy,
				cond1: gameData.cond1,
				cond2: false,
				cond3: false,
				cond4: false,
				cond5: false
			})
			.returning();

		// Si existe un pairing, actualizarlo
		if (pairingId) {
			await db
				.update(weeklyPairings)
				.set({
					status: 2, // Completado
					gameId: newGame.id
				})
				.where(eq(weeklyPairings.id, pairingId));
		}

		// Obtener el juego con sus relaciones
		const whitePlayers = alias(players, 'white_player');
		const blackPlayers = alias(players, 'black_player');

		const [gameWithRelations] = await db
			.select({
				id: games.id,
				whiteId: games.whiteId,
				blackId: games.blackId,
				result: games.result,
				playedAt: games.playedAt,
				week: games.week,
				seasonId: games.seasonId,
				createdBy: games.createdBy,
				cond1: games.cond1,
				cond2: games.cond2,
				cond3: games.cond3,
				cond4: games.cond4,
				cond5: games.cond5,
				whitePlayer: {
					id: whitePlayers.id,
					name: whitePlayers.name,
					startingElo: whitePlayers.startingElo,
					active: whitePlayers.active
				},
				blackPlayer: {
					id: blackPlayers.id,
					name: blackPlayers.name,
					startingElo: blackPlayers.startingElo,
					active: blackPlayers.active
				},
				season: {
					id: seasons.id,
					name: seasons.name,
					description: seasons.description,
					startDate: seasons.startDate,
					endDate: seasons.endDate,
					active: seasons.active,
					prizeUrl: seasons.prizeUrl
				}
			})
			.from(games)
			.where(eq(games.id, newGame.id))
			.leftJoin(whitePlayers, eq(games.whiteId, whitePlayers.id))
			.leftJoin(blackPlayers, eq(games.blackId, blackPlayers.id))
			.leftJoin(seasons, eq(games.seasonId, seasons.id))
			.limit(1);

		if (!gameWithRelations) {
			throw new Error('Error al obtener el juego creado');
		}

		console.log('Game created successfully:', gameWithRelations);

		return json({
			success: true,
			game: gameWithRelations
		});
	} catch (error) {
		console.error('Error al crear la partida:', error);
		return json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Error al crear la partida'
			},
			{ status: 500 }
		);
	}
};
