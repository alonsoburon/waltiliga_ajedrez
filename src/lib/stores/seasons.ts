// stores/seasons.ts
import { writable, derived } from 'svelte/store';
import type { Season, Game } from '$lib/types';

interface SeasonWithStats extends Season {
	gamesCount: number;
	activePlayers: number;
	isActive: boolean;
}

function createSeasonsStore() {
	const seasonsStore = writable<Season[]>([]);
	const gamesStore = writable<Game[]>([]);

	// Store derivado con estadísticas
	const seasonsWithStats = derived([seasonsStore, gamesStore], ([$seasons, $games]) => {
		return $seasons.map((season) => {
			const seasonGames = $games.filter((g) => g.seasonId === season.id);
			const uniquePlayers = new Set(seasonGames.flatMap((g) => [g.whiteId, g.blackId]));

			return {
				...season,
				gamesCount: seasonGames.length,
				activePlayers: uniquePlayers.size,
				// Cambiar la lógica de isActive para incluir el campo active
				isActive:
					season.active &&
					new Date() >= new Date(season.startDate) &&
					new Date() <= new Date(season.endDate)
			};
		});
	});

	// Store derivado para la temporada activa
	const currentSeason = derived(seasonsWithStats, ($stats) => $stats.find((s) => s.isActive));

	function filterBySeasonId<T extends { seasonId: number }>(items: T[], seasonId: number | 'all') {
		if (seasonId === 'all') return items;
		return items.filter((item) => item.seasonId === seasonId);
	}

	return {
		subscribe: seasonsStore.subscribe,
		seasonsWithStats,
		currentSeason,
		setData: (seasons: Season[], games: Game[]) => {
			seasonsStore.set(seasons);
			gamesStore.set(games);
		},
		getSeasonDates: (seasonId: number | 'all') => {
			return derived(seasonsStore, ($seasons) => {
				if (seasonId === 'all') {
					const allDates = $seasons.flatMap((s) => [new Date(s.startDate), new Date(s.endDate)]);
					return {
						startDate: new Date(Math.min(...allDates.map((d) => d.getTime()))),
						endDate: new Date(Math.max(...allDates.map((d) => d.getTime())))
					};
				}

				const season = $seasons.find((s) => s.id === seasonId);
				return season
					? {
							startDate: new Date(season.startDate),
							endDate: new Date(season.endDate)
						}
					: null;
			});
		},
		filterBySeasonId,
		addSeason: (season: Season) => {
			seasonsStore.update((s) => [...s, season]);
		},
		updateSeason: (updatedSeason: Season) => {
			seasonsStore.update((seasons) =>
				seasons.map((s) => (s.id === updatedSeason.id ? updatedSeason : s))
			);
		}
	};
}

export const seasons = createSeasonsStore();
