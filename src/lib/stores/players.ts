// stores/players.ts
import { writable, derived } from 'svelte/store';
import type { Player } from '$lib/types';

function createPlayersStore() {
	const { subscribe, set, update } = writable<Player[]>([]);

	const activePlayers = derived(subscribe, ($players) => $players.filter((p) => p.active));

	const playersByDivision = derived(
		subscribe,
		($players) => (divisionId: number) => $players.filter((p) => p.divisionId === divisionId)
	);

	return {
		subscribe,
		activePlayers,
		playersByDivision,
		setPlayers: (players: Player[]) => set(players),
		updatePlayer: (updatedPlayer: Player) => {
			update((players) => players.map((p) => (p.id === updatedPlayer.id ? updatedPlayer : p)));
		},
		addPlayer: (player: Player) => {
			update((players) => [...players, player]);
		}
	};
}

export const players = createPlayersStore();
