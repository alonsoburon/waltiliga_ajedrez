// src/lib/stores/elo.ts
import { derived, writable } from 'svelte/store';
import type { Game, Player, PlayerElo, EloHistoryEntry } from '$lib/types';

function createEloStore() {
	const games = writable<Game[]>([]);
	const players = writable<Player[]>([]);
	const eloCache = new Map<string, number>();

	// Store derivado principal
	const playerElos = derived([games, players], ([$games, $players]) => {
		const elos: PlayerElo[] = $players.map((player) => {
			const playerGames = $games
				.filter((g) => g.whiteId === player.id || g.blackId === player.id)
				.sort((a, b) => new Date(a.playedAt).getTime() - new Date(b.playedAt).getTime());

			const historicalElos: EloHistoryEntry[] = playerGames.map((game) => {
				const cacheKey = `${player.id}-${game.id}`;
				let elo = eloCache.get(cacheKey);

				if (elo === undefined) {
					elo = calculateHistoricalElo($games, $players, player.id, game.id + 1);
					eloCache.set(cacheKey, elo);
				}

				const previousElo = calculateHistoricalElo($games, $players, player.id, game.id);

				return {
					gameId: game.id,
					date: new Date(game.playedAt),
					elo,
					change: elo - previousElo,
					seasonId: game.seasonId
				};
			});

			return {
				playerId: player.id,
				currentElo:
					historicalElos.length > 0
						? historicalElos[historicalElos.length - 1].elo
						: player.startingElo,
				historicalElos
			};
		});

		return elos;
	});

	function calculateHistoricalElo(
		allGames: Game[],
		allPlayers: Player[],
		playerId: number,
		upToGameId: number
	): number {
		const player = allPlayers.find((p) => p.id === playerId);
		if (!player) return 500;

		let currentElo = player.startingElo;

		const relevantGames = allGames
			.filter((g) => g.id < upToGameId)
			.filter((g) => g.whiteId === playerId || g.blackId === playerId)
			.sort((a, b) => new Date(a.playedAt).getTime() - new Date(b.playedAt).getTime());

		for (const game of relevantGames) {
			const isWhite = game.whiteId === playerId;
			const opponentId = isWhite ? game.blackId : game.whiteId;
			const opponent = allPlayers.find((p) => p.id === opponentId);

			if (!opponent) continue;

			const result = isWhite ? game.result : -game.result;
			const eloChange = calculateEloChange(currentElo, opponent.startingElo, result);
			currentElo += eloChange;
		}

		return currentElo;
	}

	function calculateEloChange(playerElo: number, opponentElo: number, result: number): number {
		const K = 50;
		const expectedScore = 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 500));
		const actualScore = (result + 1) / 2; // Convierte -1/0/1 a 0/0.5/1
		return Math.round(K * (actualScore - expectedScore));
	}

	return {
		subscribe: playerElos.subscribe,

		setData: (newGames: Game[], newPlayers: Player[]) => {
			eloCache.clear();
			games.set(newGames);
			players.set(newPlayers);
		},

		getPlayerEloHistory: (playerId: number) => {
			return derived(playerElos, ($elos) => {
				const playerElo = $elos.find((e) => e.playerId === playerId);
				return playerElo?.historicalElos ?? [];
			});
		},

		getCurrentElo: (playerId: number) => {
			return derived(playerElos, ($elos) => {
				const playerElo = $elos.find((e) => e.playerId === playerId);
				return playerElo?.currentElo;
			});
		}
	};
}

export const elo = createEloStore();
