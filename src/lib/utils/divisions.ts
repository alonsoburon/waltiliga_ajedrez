// lib/utils/divisions.ts
import type { Player, PlayerElo } from '$lib/types';

export const DIVISION_TIERS = {
	GOLD: { percentile: 0.33, name: 'Gold', color: 'text-yellow-400' },
	SILVER: { percentile: 0.66, name: 'Silver', color: 'text-gray-400' },
	BRONZE: { percentile: 1, name: 'Bronze', color: 'text-orange-700' }
};

export interface DivisionSuggestion {
	playerId: number;
	currentElo: number;
	suggestedDivision: {
		name: string;
		color: string;
	};
	percentile: string;
}

export interface DivisionThreshold {
	division: string;
	threshold: number;
	percentile: string;
}

export function getSuggestedDivisions(players: Player[], elos: PlayerElo[]): DivisionSuggestion[] {
	// Combinar players con sus ELOs actuales
	const playersWithElo = players
		.filter((p) => p.active)
		.map((player) => {
			const playerElo = elos.find((e) => e.playerId === player.id);
			return {
				...player,
				currentElo: playerElo?.currentElo || player.startingElo
			};
		})
		.sort((a, b) => b.currentElo - a.currentElo);

	const totalPlayers = playersWithElo.length;

	return playersWithElo.map((player, index) => {
		const percentile = index / totalPlayers;

		const division =
			Object.entries(DIVISION_TIERS).find(([, tier]) => percentile <= tier.percentile)?.[1] ||
			DIVISION_TIERS.IRON;

		return {
			playerId: player.id,
			currentElo: player.currentElo,
			suggestedDivision: {
				name: division.name,
				color: division.color
			},
			percentile: (percentile * 100).toFixed(1) + '%'
		};
	});
}

// También podemos obtener los límites de ELO para cada división
export function getDivisionThresholds(players: Player[], elos: PlayerElo[]): DivisionThreshold[] {
	const sortedElos = players
		.filter((p) => p.active)
		.map((player) => {
			const playerElo = elos.find((e) => e.playerId === player.id);
			return playerElo?.currentElo || player.startingElo;
		})
		.sort((a, b) => b - a);

	return Object.entries(DIVISION_TIERS).map(([name, tier]) => {
		const index = Math.floor(sortedElos.length * tier.percentile);
		return {
			division: name,
			threshold: sortedElos[index] || 0,
			percentile: (tier.percentile * 100).toFixed(0) + '%'
		};
	});
}
