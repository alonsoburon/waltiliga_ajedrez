// stores/games.ts
import { writable, derived, get } from 'svelte/store';
import type { Game, Player } from '$lib/types';

interface GameWithEloChanges extends Game {
	whiteEloChange: {
		previous: number;
		new: number;
		change: number;
	};
	blackEloChange: {
		previous: number;
		new: number;
		change: number;
	};
}

function createGamesStore() {
	const { subscribe, set, update } = writable<GameWithEloChanges[]>([]);
	const players = writable<Player[]>([]);
	const eloCache = new Map<string, number>();

	function calculateEloChange(whiteElo: number, blackElo: number, result: number): number {
		const K = 50;
		const expectedScore = 1 / (1 + Math.pow(10, (blackElo - whiteElo) / 500));
		const actualScore = (result + 1) / 2; // -1 -> 0, 0 -> 0.5, 1 -> 1
		return Math.round(K * (actualScore - expectedScore));
	}

	function getPlayerEloAtGame(
		playerId: number,
		gameId: number,
		allGames: Game[],
		allPlayers: Player[]
	): number {
		const cacheKey = `${playerId}-${gameId}`;
		if (eloCache.has(cacheKey)) {
			return eloCache.get(cacheKey)!;
		}

		const player = allPlayers.find((p) => p.id === playerId);
		if (!player) return 500;

		let currentElo = player.startingElo;

		const previousGames = allGames
			.filter((g) => g.id < gameId)
			.filter((g) => g.whiteId === playerId || g.blackId === playerId)
			.sort((a, b) => a.id - b.id);

		for (const game of previousGames) {
			const isWhite = game.whiteId === playerId;
			const opponentId = isWhite ? game.blackId : game.whiteId;
			const opponentElo = getPlayerEloAtGame(opponentId, game.id, allGames, allPlayers);

			if (isWhite) {
				const eloChange = calculateEloChange(currentElo, opponentElo, game.result);
				currentElo += eloChange;
			} else {
				const eloChange = calculateEloChange(opponentElo, currentElo, game.result);
				currentElo -= eloChange;
			}
		}

		eloCache.set(cacheKey, currentElo);
		return currentElo;
	}

	function calculateGameEloChanges(
		game: Game,
		allGames: Game[],
		allPlayers: Player[]
	): GameWithEloChanges {
		const whitePrevElo = getPlayerEloAtGame(game.whiteId, game.id, allGames, allPlayers);
		const blackPrevElo = getPlayerEloAtGame(game.blackId, game.id, allGames, allPlayers);

		const eloChange = calculateEloChange(whitePrevElo, blackPrevElo, game.result);

		return {
			...game,
			whiteEloChange: {
				previous: whitePrevElo,
				new: whitePrevElo + eloChange,
				change: eloChange
			},
			blackEloChange: {
				previous: blackPrevElo,
				new: blackPrevElo - eloChange,
				change: -eloChange
			}
		};
	}

	return {
		subscribe,

		setData: (games: Game[] | undefined, playersList: Player[] | undefined) => {
			// Validar que los datos existan
			if (!games || !playersList) {
				console.warn('⚠️ Intentando establecer datos nulos o indefinidos en gamesStore');
				set([]); // Establecer array vacío como fallback
				players.set([]);
				return;
			}

			eloCache.clear();
			players.set(playersList);

			const gamesWithElo = games.map((game) => calculateGameEloChanges(game, games, playersList));
			set(gamesWithElo);
		},

		addGame: (game: Game) => {
			update((games) => {
				const newGames = [game, ...games];
				const playersList = get(players);
				const updatedGame = calculateGameEloChanges(game, newGames, playersList);
				return [updatedGame, ...games];
			});
		},

		getEloChange: (game: GameWithEloChanges, isWhite: boolean) => {
			const change = isWhite ? game.whiteEloChange.change : game.blackEloChange.change;
			return {
				text: change > 0 ? `+${change}` : `${change}`,
				className: change > 0 ? 'text-success-500' : change < 0 ? 'text-error-500' : ''
			};
		},

		// Métodos auxiliares
		getGameResult: (game: Game) => {
			return game.result === 1
				? 'Victoria Blancas'
				: game.result === -1
					? 'Victoria Negras'
					: 'Tablas';
		},

		getResultClass: (result: string) =>
			({
				'Victoria Blancas': 'badge-white',
				'Victoria Negras': 'badge-black',
				Tablas: 'badge-draw'
			})[result] || 'variant-soft',

		// Métodos para filtrado
		filterByPlayer: (playerId: number) => {
			return derived(subscribe, ($games) =>
				$games.filter((g) => g.whiteId === playerId || g.blackId === playerId)
			);
		},

		filterBySeason: (seasonId: number) => {
			return derived(subscribe, ($games) => $games.filter((g) => g.seasonId === seasonId));
		},

		// Método para obtener el ELO actual de un jugador
		getCurrentElo: (playerId: number) => {
			return derived([subscribe, players], ([$games, $players]) => {
				const latestGame = [...$games]
					.sort((a, b) => b.id - a.id)
					.find((g) => g.whiteId === playerId || g.blackId === playerId);

				if (!latestGame) {
					const player = $players.find((p) => p.id === playerId);
					return player?.startingElo ?? 500;
				}

				return playerId === latestGame.whiteId
					? latestGame.whiteEloChange.new
					: latestGame.blackEloChange.new;
			});
		}
	};
}

export const gamesStore = createGamesStore();
