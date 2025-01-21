// stores/weeklyPairings.ts
import { derived, writable } from 'svelte/store';
import type { WeeklyPairing, Player, Game } from '$lib/types';
import { seasons } from './seasons';

export interface PairingWithDetails extends WeeklyPairing {
	white: Player;
	black: Player;
	game?: Game;
}

function createWeeklyPairingsStore() {
	const pairingsStore = writable<PairingWithDetails[]>([]);
	const currentWeek = writable<number>(1);

	// Store derivado para los emparejamientos de la semana actual
	const currentWeekPairings = derived(
		[pairingsStore, currentWeek, seasons],
		([$pairings, $currentWeek, $seasons]) => {
			const activeSeason = $seasons.find((s) => s.active);
			if (!activeSeason) return [];

			return $pairings.filter((p) => p.week === $currentWeek && p.seasonId === activeSeason.id);
		}
	);

	// Store derivado para mis emparejamientos
	const myPairings = derived([currentWeekPairings], ([$pairings], playerId?: number) => {
		if (!playerId) return [];
		return $pairings.filter((p) => p.whiteId === playerId || p.blackId === playerId);
	});

	// Store derivado para otros emparejamientos
	const otherPairings = derived([currentWeekPairings], ([$pairings], playerId?: number) => {
		if (!playerId) return $pairings;
		return $pairings.filter((p) => p.whiteId !== playerId && p.blackId !== playerId);
	});

	return {
		subscribe: pairingsStore.subscribe,
		currentWeek: {
			subscribe: currentWeek.subscribe,
			set: currentWeek.set
		},
		currentWeekPairings,
		myPairings,
		otherPairings,

		setData: (pairings: PairingWithDetails[], week: number) => {
			pairingsStore.set(pairings);
			currentWeek.set(week);
		},

		updatePairing: (updatedPairing: PairingWithDetails) => {
			pairingsStore.update((pairings) =>
				pairings.map((p) => (p.id === updatedPairing.id ? updatedPairing : p))
			);
		},

		addGame: (pairingId: number, game: Game) => {
			pairingsStore.update((pairings) =>
				pairings.map((p) => (p.id === pairingId ? { ...p, game, status: 2 } : p))
			);
		}
	};
}

export const weeklyPairings = createWeeklyPairingsStore();
