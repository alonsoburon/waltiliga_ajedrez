// src/lib/server/players.ts
export async function calculateCurrentElo(playerId: number, seasonId: number) {
	const player = await db.query.players.findFirst({
		where: eq(players.id, playerId)
	});

	const games = await db.query.games.findMany({
		where: and(
			eq(games.seasonId, seasonId),
			or(eq(games.whiteId, playerId), eq(games.blackId, playerId))
		),
		orderBy: [asc(games.playedAt)],
		with: {
			whitePlayer: true,
			blackPlayer: true
		}
	});

	let currentElo = player.startingElo;

	for (const game of games) {
		if (game.whiteId === playerId) {
			const eloChange = calculateEloChange(
				game.whitePlayer.startingElo,
				game.blackPlayer.startingElo,
				game.result
			);
			currentElo += eloChange;
		} else {
			const eloChange = calculateEloChange(
				game.whitePlayer.startingElo,
				game.blackPlayer.startingElo,
				game.result
			);
			currentElo -= eloChange;
		}
	}

	return currentElo;
}
