// lib/stores/admin.ts
import { writable, derived } from 'svelte/store';
import type { Player, Division, Season, Game } from '$lib/types';
import { seasons } from './seasons';
import { playerStats } from './playerStats';
import { elo } from './elo';

function createAdminStore() {
	const divisionsStore = writable<Division[]>([]);
	const playersStore = writable<Player[]>([]);

	// Store derivado para jugadores con sus estadísticas por división
	const playersByDivision = derived([divisionsStore, playerStats], ([$divisions, $playerStats]) => {
		return $divisions.reduce(
			(acc, division) => {
				acc[division.id] = $playerStats
					.filter((p) => p.divisionId === division.id)
					.sort((a, b) => b.currentElo - a.currentElo);
				return acc;
			},
			{} as Record<number, typeof $playerStats>
		);
	});

	// Store para estadísticas generales
	const stats = derived([seasons, playerStats, elo], ([$seasons, $playerStats, $elo]) => {
		const activeSeason = $seasons.find((s) => s.isActive);
		return {
			totalPlayers: $playerStats.length,
			activePlayers: $playerStats.filter((p) => p.active).length,
			averageElo: Math.round(
				$playerStats.reduce((acc, p) => acc + p.currentElo, 0) / $playerStats.length
			),
			totalGames: activeSeason ? $playerStats.reduce((acc, p) => acc + p.gamesPlayed, 0) / 2 : 0,
			season: activeSeason
		};
	});

	// Store principal que combina divisions y players
	const store = derived([divisionsStore, playersStore], ([$divisions, $players]) => ({
		divisions: $divisions,
		players: $players
	}));

	return {
		subscribe: store.subscribe, // Exponemos el subscribe del store principal
		playersByDivision,
		stats,

		setData: (
			newDivisions: Division[],
			newPlayers: Player[],
			newGames: Game[],
			newSeasons: Season[]
		) => {
			divisionsStore.set(newDivisions);
			playersStore.set(newPlayers);
			seasons.setData(newSeasons, newGames);
			playerStats.setData(newGames, newPlayers);
			elo.setData(newGames, newPlayers);
		},

		// Métodos de actualización
		updatePlayer: (player: Player) => {
			playersStore.update((ps) => ps.map((p) => (p.id === player.id ? player : p)));
		},

		updateDivision: (division: Division) => {
			divisionsStore.update((ds) => ds.map((d) => (d.id === division.id ? division : d)));
		}
	};
}

export const admin = createAdminStore();
