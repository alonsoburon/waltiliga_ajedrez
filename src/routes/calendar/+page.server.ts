// routes/calendar/+page.server.ts
import { db } from '$lib/server/db';
import { user, players, weeklyPairings, seasons, games } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { validateGame, getSeasonWeek } from '$lib/utils/game';

export const actions = {
	create: async ({ request, locals }) => {
		if (!locals.auth?.user) {
			return fail(401, { error: 'No autorizado' });
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
				return fail(400, { error: 'Datos inválidos' });
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
				return fail(400, { error: errors.join(', ') });
			}

			// Obtener la temporada para calcular la semana
			const [season] = await db.select().from(seasons).where(eq(seasons.id, seasonId)).limit(1);

			if (!season) {
				return fail(400, { error: 'Temporada no encontrada' });
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

			return { success: true, game: gameWithRelations };
		} catch (error) {
			console.error('Error al crear la partida:', error);
			return fail(500, {
				error: error instanceof Error ? error.message : 'Error al crear la partida'
			});
		}
	}
} satisfies Actions;

async function generateWeeklyPairings(seasonId: number, week: number) {
	// Obtener jugadores activos
	const activePlayers = await db.select().from(players).where(eq(players.active, true)).execute();

	// Obtener TODOS los juegos previos de la temporada
	const allPreviousGames = await db
		.select()
		.from(games)
		.where(eq(games.seasonId, seasonId))
		.execute();

	// Historial de enfrentamientos previos (ahora solo para referencia)
	const pairingHistory = new Set(
		allPreviousGames.map(
			(g) => `${Math.min(g.whiteId, g.blackId)}-${Math.max(g.whiteId, g.blackId)}`
		)
	);

	// Contar partidas por jugador en la semana actual
	const weeklyGamesCount = new Map<number, number>();
	activePlayers.forEach((p) => weeklyGamesCount.set(p.id, 0));

	// Contar balance de colores
	const colorBalance = new Map<number, number>();
	activePlayers.forEach((p) => colorBalance.set(p.id, 0));
	allPreviousGames.forEach((g) => {
		colorBalance.set(g.whiteId, (colorBalance.get(g.whiteId) || 0) + 1);
		colorBalance.set(g.blackId, (colorBalance.get(g.blackId) || 0) - 1);
	});

	const newPairings = [];
	const maxGamesPerWeek = 3;

	// Primera fase: intentar emparejar sin repetir
	while (true) {
		const availablePlayers = activePlayers
			.filter((p) => (weeklyGamesCount.get(p.id) || 0) < maxGamesPerWeek)
			.sort(() => Math.random() - 0.5)
			.sort((a, b) => (weeklyGamesCount.get(a.id) || 0) - (weeklyGamesCount.get(b.id) || 0));

		if (availablePlayers.length < 2) break;

		const player1 = availablePlayers[0];
		let paired = false;

		for (let i = 1; i < availablePlayers.length; i++) {
			const player2 = availablePlayers[i];
			const pairingKey = `${Math.min(player1.id, player2.id)}-${Math.max(player1.id, player2.id)}`;

			if (!pairingHistory.has(pairingKey)) {
				const p1Balance = colorBalance.get(player1.id) || 0;
				const p2Balance = colorBalance.get(player2.id) || 0;
				const p1ShouldBeWhite = p1Balance <= p2Balance;

				newPairings.push({
					whiteId: p1ShouldBeWhite ? player1.id : player2.id,
					blackId: p1ShouldBeWhite ? player2.id : player1.id,
					week,
					seasonId,
					status: 0
				});

				weeklyGamesCount.set(player1.id, (weeklyGamesCount.get(player1.id) || 0) + 1);
				weeklyGamesCount.set(player2.id, (weeklyGamesCount.get(player2.id) || 0) + 1);
				pairingHistory.add(pairingKey);
				paired = true;
				break;
			}
		}

		if (!paired) break;
	}

	// Segunda fase: forzar emparejamientos para completar las 3 partidas
	while (true) {
		const playersNeedingGames = activePlayers
			.filter((p) => (weeklyGamesCount.get(p.id) || 0) < maxGamesPerWeek)
			.sort(() => Math.random() - 0.5)
			.sort((a, b) => (weeklyGamesCount.get(a.id) || 0) - (weeklyGamesCount.get(b.id) || 0));

		if (playersNeedingGames.length < 2) break;

		const player1 = playersNeedingGames[0];
		const player2 = playersNeedingGames[1];
		const p1Balance = colorBalance.get(player1.id) || 0;
		const p2Balance = colorBalance.get(player2.id) || 0;
		const p1ShouldBeWhite = p1Balance <= p2Balance;

		newPairings.push({
			whiteId: p1ShouldBeWhite ? player1.id : player2.id,
			blackId: p1ShouldBeWhite ? player2.id : player1.id,
			week,
			seasonId,
			status: 0
		});

		weeklyGamesCount.set(player1.id, (weeklyGamesCount.get(player1.id) || 0) + 1);
		weeklyGamesCount.set(player2.id, (weeklyGamesCount.get(player2.id) || 0) + 1);
	}

	console.log('Pairings generados:', newPairings.length);
	console.log('Distribución de partidas:', Object.fromEntries(weeklyGamesCount));

	if (newPairings.length > 0) {
		await db.insert(weeklyPairings).values(newPairings);
	}
}

export const load = (async ({ locals }) => {
	if (!locals?.auth?.user) {
		throw redirect(302, '/auth/login');
	}

	// Obtener todas las temporadas y juegos para el store
	const [allSeasons, allGames] = await Promise.all([
		db.select().from(seasons).execute(),
		db.select().from(games).execute()
	]);

	const now = new Date();
	const activeSeason = allSeasons.find((season) => {
		const startDate = new Date(season.startDate);
		const endDate = new Date(season.endDate);
		return season.active && now >= startDate && now <= endDate;
	});

	if (!activeSeason) {
		return {
			myPairings: [],
			otherPairings: [],
			currentWeek: 0,
			season: null,
			seasons: allSeasons,
			games: allGames,
			user: locals.auth.user,
			players: []
		};
	}

	const [activePlayers, userWithPlayer] = await Promise.all([
		db.select().from(players).where(eq(players.active, true)).execute(),
		db.select().from(user).where(eq(user.id, locals.auth.user.id)).execute()
	]);

	if (!userWithPlayer[0]?.playerId) {
		return {
			myPairings: [],
			otherPairings: [],
			currentWeek: 0,
			season: activeSeason,
			seasons: allSeasons,
			games: allGames,
			user: locals.auth.user,
			players: activePlayers,
			error: 'Usuario no tiene jugador asociado'
		};
	}

	const playerId = userWithPlayer[0].playerId;
	const currentWeek = Math.ceil(
		(now.getTime() - new Date(activeSeason.startDate).getTime()) / (7 * 24 * 60 * 60 * 1000)
	);

	const whitePlayers = alias(players, 'white_player');
	const blackPlayers = alias(players, 'black_player');

	let weekPairings = await db
		.select({
			id: weeklyPairings.id,
			whiteId: weeklyPairings.whiteId,
			blackId: weeklyPairings.blackId,
			week: weeklyPairings.week,
			seasonId: weeklyPairings.seasonId,
			status: weeklyPairings.status,
			white: {
				id: whitePlayers.id,
				name: whitePlayers.name,
				startingElo: whitePlayers.startingElo,
				active: whitePlayers.active
			},
			black: {
				id: blackPlayers.id,
				name: blackPlayers.name,
				startingElo: blackPlayers.startingElo,
				active: blackPlayers.active
			},
			game: {
				id: games.id,
				result: games.result,
				playedAt: games.playedAt,
				createdBy: games.createdBy
			}
		})
		.from(weeklyPairings)
		.where(and(eq(weeklyPairings.seasonId, activeSeason.id), eq(weeklyPairings.week, currentWeek)))
		.leftJoin(whitePlayers, eq(weeklyPairings.whiteId, whitePlayers.id))
		.leftJoin(blackPlayers, eq(weeklyPairings.blackId, blackPlayers.id))
		.leftJoin(games, eq(weeklyPairings.gameId, games.id));

	// Si no hay pairings o son de una semana anterior, generar nuevos
	if (weekPairings.length === 0 || weekPairings[0].week < currentWeek) {
		console.log('Generando nuevos pairings para la semana', currentWeek);

		// Eliminar pairings antiguos de la semana actual
		await db
			.delete(weeklyPairings)
			.where(
				and(eq(weeklyPairings.seasonId, activeSeason.id), eq(weeklyPairings.week, currentWeek))
			);

		await generateWeeklyPairings(activeSeason.id, currentWeek);

		// Obtener los nuevos pairings
		weekPairings = await db
			.select({
				id: weeklyPairings.id,
				whiteId: weeklyPairings.whiteId,
				blackId: weeklyPairings.blackId,
				week: weeklyPairings.week,
				seasonId: weeklyPairings.seasonId,
				status: weeklyPairings.status,
				white: {
					id: whitePlayers.id,
					name: whitePlayers.name,
					startingElo: whitePlayers.startingElo,
					active: whitePlayers.active
				},
				black: {
					id: blackPlayers.id,
					name: blackPlayers.name,
					startingElo: blackPlayers.startingElo,
					active: blackPlayers.active
				},
				game: {
					id: games.id,
					result: games.result,
					playedAt: games.playedAt,
					createdBy: games.createdBy
				}
			})
			.from(weeklyPairings)
			.where(
				and(eq(weeklyPairings.seasonId, activeSeason.id), eq(weeklyPairings.week, currentWeek))
			)
			.leftJoin(whitePlayers, eq(weeklyPairings.whiteId, whitePlayers.id))
			.leftJoin(blackPlayers, eq(weeklyPairings.blackId, blackPlayers.id))
			.leftJoin(games, eq(weeklyPairings.gameId, games.id));
	}

	// Filtrar emparejamientos para el jugador actual
	const myPairings = weekPairings.filter(
		(pairing) => pairing.whiteId === playerId || pairing.blackId === playerId
	);

	// Filtrar emparejamientos para otros jugadores
	const otherPairings = weekPairings.filter(
		(pairing) => pairing.whiteId !== playerId && pairing.blackId !== playerId
	);

	return {
		myPairings,
		otherPairings,
		currentWeek,
		season: activeSeason,
		seasons: allSeasons,
		games: allGames,
		user: locals.auth.user,
		players: activePlayers,
		isGenerating: weekPairings.length === 0 // Indicador de generación
	};
}) satisfies PageServerLoad;
