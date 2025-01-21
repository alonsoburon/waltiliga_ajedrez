// lib/stores/playerStats.ts
import { derived, writable, type Readable } from 'svelte/store';
import type { Player, Game } from '$lib/types';
import { gamesStore } from './games';
import { elo } from './elo';

export interface PlayerStats extends Player {
	currentElo: number;
	gamesPlayed: number;
	wins: number;
	draws: number;
	losses: number;
	winRate: string;
	eloChange: number;
	winStreak: number;
	bestWinStreak: number;
	winsAsWhite: number;
	winsAsBlack: number;
	averageEloOpponents: number;
	lastGames: string[];
	performance: number;
}

function calculatePerformance(games: Game[], playerId: number): number {
	if (games.length === 0) return 0;

	const playerGames = games.filter((g) => g.whiteId === playerId || g.blackId === playerId);
	let totalOpponentElo = 0;
	let wins = 0;
	let losses = 0;

	playerGames.forEach((game) => {
		const isWhite = game.whiteId === playerId;
		const opponentElo = isWhite ? game.blackPlayer.startingElo : game.whitePlayer.startingElo;
		totalOpponentElo += opponentElo;

		if ((isWhite && game.result === 1) || (!isWhite && game.result === -1)) wins++;
		else if ((isWhite && game.result === -1) || (!isWhite && game.result === 1)) losses++;
	});

	const averageOpponentElo = totalOpponentElo / playerGames.length;
	return averageOpponentElo + (400 * (wins - losses)) / playerGames.length;
}

function createPlayerStatsStore() {
	const games = writable<Game[]>([]);
	const players = writable<Player[]>([]);

	const stats: Readable<PlayerStats[]> = derived(
		[games, players, gamesStore, elo],
		([$games, $players, $gamesStore, $elo]) => {
			if (!$games || !$players) return [];

			return ($players || []).map((player) => {
				const playerGames = ($games || [])
					.filter((game) => game.whiteId === player.id || game.blackId === player.id)
					.sort((a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime());

				let currentStreak = 0;
				let bestStreak = 0;
				let lastResults: string[] = [];
				let totalOpponentElo = 0;
				let winsAsWhite = 0;
				let winsAsBlack = 0;

				playerGames.forEach((game) => {
					const isWhite = game.whiteId === player.id;
					const won = (isWhite && game.result === 1) || (!isWhite && game.result === -1);
					const drew = game.result === 0;

					if (won) {
						currentStreak++;
						bestStreak = Math.max(bestStreak, currentStreak);
						if (isWhite) winsAsWhite++;
						else winsAsBlack++;
					} else {
						currentStreak = 0;
					}

					if (lastResults.length < 5) {
						lastResults.push(won ? 'W' : drew ? 'D' : 'L');
					}

					// Usar el ELO histórico del oponente en el momento de la partida
					const opponentId = isWhite ? game.blackId : game.whiteId;
					const opponentEloInfo = $elo.find((e) => e.playerId === opponentId);
					const opponentHistoricalElo = opponentEloInfo?.historicalElos.find(
						(h) => h.gameId === game.id
					)?.elo;
					totalOpponentElo +=
						opponentHistoricalElo ??
						(isWhite ? game.blackPlayer.startingElo : game.whitePlayer.startingElo);
				});

				const wins = playerGames.filter(
					(game) =>
						(game.whiteId === player.id && game.result === 1) ||
						(game.blackId === player.id && game.result === -1)
				).length;

				const draws = playerGames.filter((game) => game.result === 0).length;
				const losses = playerGames.length - wins - draws;

				// Obtener el ELO actual del store de ELO
				const playerEloInfo = $elo.find((e) => e.playerId === player.id);
				const currentElo = playerEloInfo ? playerEloInfo.currentElo : player.startingElo;

				return {
					...player,
					currentElo,
					gamesPlayed: playerGames.length,
					wins,
					draws,
					losses,
					winRate: playerGames.length > 0 ? ((wins / playerGames.length) * 100).toFixed(1) : '0',
					eloChange: currentElo - player.startingElo,
					winStreak: currentStreak,
					bestWinStreak: bestStreak,
					winsAsWhite,
					winsAsBlack,
					lastGames: lastResults,
					averageEloOpponents: playerGames.length
						? Math.round(totalOpponentElo / playerGames.length)
						: 0,
					performance: calculatePerformance(playerGames, player.id)
				};
			});
		}
	);

	return {
		setData: (newGames: Game[], newPlayers: Player[]) => {
			if (!newGames || !newPlayers) return;
			games.set(newGames || []);
			players.set(newPlayers || []);
			// Actualizar también el store de ELO
			elo.setData(newGames, newPlayers);
		},
		subscribe: stats.subscribe
	};
}

export const playerStats = createPlayerStatsStore();
