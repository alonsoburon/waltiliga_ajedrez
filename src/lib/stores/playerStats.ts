// src/lib/stores/playerStats.ts
import { derived, writable, type Readable } from 'svelte/store';
import { calculateHistoricalElo } from '$lib/elo';
import type { Player, Game } from '$lib/types';

export interface PlayerStats extends Player {
	currentElo: number;
	gamesPlayed: number;
	wins: number;
	draws: number;
	losses: number;
	winRate: string;
	eloChange: number;
}

function createPlayerStatsStore() {
	const games = writable<Game[]>([]);
	const players = writable<Player[]>([]);

	const stats: Readable<PlayerStats[]> = derived([games, players], ([$games, $players]) => {
		return $players.map((player) => {
			const playerGames = $games.filter(
				(game) => game.whiteId === player.id || game.blackId === player.id
			);

			const wins = playerGames.filter(
				(game) =>
					(game.whiteId === player.id && game.result === 1) ||
					(game.blackId === player.id && game.result === -1)
			).length;

			const draws = playerGames.filter((game) => game.result === 0).length;
			const losses = playerGames.length - wins - draws;
			const currentElo = calculateHistoricalElo($games, $players, player.id);

			return {
				...player,
				currentElo,
				gamesPlayed: playerGames.length,
				wins,
				draws,
				losses,
				winRate: playerGames.length > 0 ? ((wins / playerGames.length) * 100).toFixed(1) : '0',
				eloChange: currentElo - player.startingElo
			};
		});
	});

	return {
		setData: (newGames: Game[], newPlayers: Player[]) => {
			games.set(newGames);
			players.set(newPlayers);
		},
		subscribe: stats.subscribe
	};
}

export const playerStats = createPlayerStatsStore();
