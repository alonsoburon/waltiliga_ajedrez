// routes/calendar/+page.server.ts
import { db } from '$lib/server/db';
import { user, players, weeklyPairings, seasons, games } from '$lib/server/db/schema';
import { eq, and, or, not, desc, asc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import type { Player } from '$lib/types';

async function generateWeeklyPairings(seasonId: number, week: number) {
	// Obtener jugadores activos
	const activePlayers = await db.query.players.findMany({
		where: eq(players.active, true)
	});

	// Obtener emparejamientos existentes de la temporada
	const existingPairings = await db.query.weeklyPairings.findMany({
		where: and(eq(weeklyPairings.seasonId, seasonId), eq(weeklyPairings.week, week))
	});

	// Historial de enfrentamientos previos
	const pairingHistory = new Set(
		existingPairings.map(
			(p) => `${Math.min(p.whiteId, p.blackId)}-${Math.max(p.whiteId, p.blackId)}`
		)
	);

	// Contar partidas por jugador en la semana actual
	const weeklyGamesCount = new Map<number, number>();
	activePlayers.forEach((p) => weeklyGamesCount.set(p.id, 0));
	existingPairings.forEach((p) => {
		weeklyGamesCount.set(p.whiteId, (weeklyGamesCount.get(p.whiteId) || 0) + 1);
		weeklyGamesCount.set(p.blackId, (weeklyGamesCount.get(p.blackId) || 0) + 1);
	});

	const newPairings = [];
	const maxGamesPerWeek = 3;

	function canPlayTogether(player1: Player, player2: Player): boolean {
		const pairingKey = `${Math.min(player1.id, player2.id)}-${Math.max(player1.id, player2.id)}`;
		return !pairingHistory.has(pairingKey);
	}

	while (true) {
		const availablePlayers = activePlayers
			.filter((p) => (weeklyGamesCount.get(p.id) || 0) < maxGamesPerWeek)
			.sort((a, b) => (weeklyGamesCount.get(a.id) || 0) - (weeklyGamesCount.get(b.id) || 0));

		if (availablePlayers.length < 2) break;

		let paired = false;
		const player1 = availablePlayers[0];

		for (let i = 1; i < availablePlayers.length; i++) {
			const player2 = availablePlayers[i];

			if (canPlayTogether(player1, player2)) {
				const p1WhiteGames = existingPairings.filter((p) => p.whiteId === player1.id).length;
				const p2WhiteGames = existingPairings.filter((p) => p.whiteId === player2.id).length;
				const p1ShouldBeWhite = p1WhiteGames <= p2WhiteGames;

				newPairings.push({
					whiteId: p1ShouldBeWhite ? player1.id : player2.id,
					blackId: p1ShouldBeWhite ? player2.id : player1.id,
					week,
					seasonId,
					status: 0
				});

				weeklyGamesCount.set(player1.id, (weeklyGamesCount.get(player1.id) || 0) + 1);
				weeklyGamesCount.set(player2.id, (weeklyGamesCount.get(player2.id) || 0) + 1);
				pairingHistory.add(
					`${Math.min(player1.id, player2.id)}-${Math.max(player1.id, player2.id)}`
				);

				paired = true;
				break;
			}
		}

		if (!paired) break;
	}

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
		db.query.seasons.findMany(),
		db.query.games.findMany()
	]);

	const activeSeason = allSeasons.find((season) => {
		const now = new Date();
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
		db.query.players.findMany({
			where: eq(players.active, true)
		}),
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
		(new Date().getTime() - new Date(activeSeason.startDate).getTime()) / (7 * 24 * 60 * 60 * 1000)
	);

	// Generar emparejamientos si es necesario
	const weekPairings = await db.query.weeklyPairings.findMany({
		where: and(eq(weeklyPairings.seasonId, activeSeason.id), eq(weeklyPairings.week, currentWeek))
	});

	if (weekPairings.length < Math.floor((activePlayers.length * 3) / 2)) {
		await generateWeeklyPairings(activeSeason.id, currentWeek);
	}

	const [myPairings, otherPairings] = await Promise.all([
		db.query.weeklyPairings.findMany({
			where: and(
				eq(weeklyPairings.seasonId, activeSeason.id),
				or(eq(weeklyPairings.whiteId, playerId), eq(weeklyPairings.blackId, playerId))
			),
			with: {
				white: true,
				black: true,
				game: true
			},
			orderBy: [asc(weeklyPairings.week)]
		}),
		db.query.weeklyPairings.findMany({
			where: and(
				eq(weeklyPairings.seasonId, activeSeason.id),
				eq(weeklyPairings.week, currentWeek),
				not(or(eq(weeklyPairings.whiteId, playerId), eq(weeklyPairings.blackId, playerId)))
			),
			with: {
				white: true,
				black: true,
				game: true
			}
		})
	]);

	return {
		myPairings,
		otherPairings,
		currentWeek,
		season: activeSeason,
		seasons: allSeasons,
		games: allGames,
		user: {
			...locals.auth.user,
			playerId
		},
		players: activePlayers
	};
}) satisfies PageServerLoad;
