// src/lib/elo.ts
export function calculateEloChange(whiteElo: number, blackElo: number, result: number) {
	const K = 50;
	const expectedScore = 1 / (1 + Math.pow(10, (blackElo - whiteElo) / 500));
	const actualScore = (result + 1) / 2; // -1 -> 0, 0 -> 0.5, 1 -> 1
	return Math.round(K * (actualScore - expectedScore));
}

function getEloAtGameTime(
	games: any[],
	players: any[],
	playerId: number,
	currentGameId: number
): number {
	// Encontrar el ELO inicial del jugador
	const player = players.find((p) => p.id === playerId);
	let elo = player?.startingElo ?? 500;

	// Filtramos los juegos anteriores al actual
	const previousGames = games.filter((g) => g.id < currentGameId).sort((a, b) => a.id - b.id);

	for (const game of previousGames) {
		if (game.whiteId === playerId) {
			const opponentElo = getEloAtGameTime(games, players, game.blackId, game.id);
			const eloChange = calculateEloChange(elo, opponentElo, game.result);
			elo += eloChange;
		} else if (game.blackId === playerId) {
			const opponentElo = getEloAtGameTime(games, players, game.whiteId, game.id);
			const eloChange = calculateEloChange(opponentElo, elo, game.result);
			elo -= eloChange;
		}
	}

	return elo;
}

const eloCache = new Map<string, number>();

export function calculateHistoricalElo(
	games: any[],
	players: any[],
	playerId: number,
	upToGameId: number = Infinity
) {
	// Encontrar el ELO inicial del jugador
	const player = players.find((p) => p.id === playerId);
	let currentElo = player?.startingElo ?? 500;

	// Ordenamos los juegos por ID/fecha
	const sortedGames = [...games].sort((a, b) => a.id - b.id).filter((g) => g.id < upToGameId);

	eloCache.clear();

	for (const game of sortedGames) {
		const cacheKey = `${playerId}-${game.id}`;

		if (eloCache.has(cacheKey)) {
			currentElo = eloCache.get(cacheKey)!;
			continue;
		}

		if (game.whiteId === playerId) {
			const opponentElo = getEloAtGameTime(games, players, game.blackId, game.id);
			const eloChange = calculateEloChange(currentElo, opponentElo, game.result);
			currentElo += eloChange;
		} else if (game.blackId === playerId) {
			const opponentElo = getEloAtGameTime(games, players, game.whiteId, game.id);
			const eloChange = calculateEloChange(opponentElo, currentElo, game.result);
			currentElo -= eloChange;
		}

		eloCache.set(cacheKey, currentElo);
	}

	return currentElo;
}
