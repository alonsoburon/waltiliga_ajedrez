// src/lib/elo.ts
export function calculateEloChange(whiteElo: number, blackElo: number, result: number) {
	const K = 50;
	const expectedScore = 1 / (1 + Math.pow(10, (blackElo - whiteElo) / 500));
	// Convertimos result (-1,0,1) a formato de puntaje (0, 0.5, 1)
	const actualScore = (result + 1) / 2; // -1 -> 0, 0 -> 0.5, 1 -> 1
	return Math.round(K * (actualScore - expectedScore));
}

export function calculateHistoricalElo(games: any[], playerId: number, upToGameId: number) {
	let currentElo = 500;
	const reversedGames = [...games].reverse();

	for (const game of reversedGames) {
		if (game.id === upToGameId) break;

		if (game.whiteId === playerId) {
			const eloChange = calculateEloChange(
				currentElo,
				500,
				game.result // -1, 0, 1
			);
			currentElo += eloChange;
		} else if (game.blackId === playerId) {
			const eloChange = calculateEloChange(
				500,
				currentElo,
				-game.result // Invertimos el resultado para las negras
			);
			currentElo -= eloChange;
		}
	}
	return currentElo;
}
