// src/lib/types.ts

export interface Player {
	id: number;
	name: string;
	startingElo: number;
	active: boolean;
	divisionId: number;
	division: Division;
}

export interface Season {
	id: number;
	name: string;
	description: string;
	startDate: string;
	endDate: string;
	active: boolean;
}

export interface SeasonStats {
	wins: number;
	draws: number;
	losses: number;
	winRate: string;
}

export interface Game {
	id: number;
	whiteId: number;
	blackId: number;
	result: number;
	playedAt: string;
	week: number;
	seasonId: number;
	createdBy: string;
	cond1: boolean;
	cond2: boolean;
	cond3: boolean;
	cond4: boolean;
	cond5: boolean;
	whitePlayer: Player;
	blackPlayer: Player;
	season: Season;
}

export interface Division {
	id: number;
	name: string;
	rank: number;
}

// Nuevos tipos para el sistema de ELO

export interface EloChange {
	previous: number;
	new: number;
	change: number;
}

export interface GameWithElo extends Game {
	whiteEloChange: EloChange;
	blackEloChange: EloChange;
}

export interface EloHistoryEntry {
	gameId: number;
	date: Date;
	elo: number;
	change: number;
	seasonId: number;
}

export interface PlayerElo {
	playerId: number;
	currentElo: number;
	historicalElos: EloHistoryEntry[];
}

export interface EloChartData {
	labels: string[];
	datasets: {
		label: string;
		data: number[];
		backgroundColor: string;
		borderColor: string;
		borderWidth: number;
		tension: number;
		fill: boolean;
	}[];
}

export interface WeeklyPairing {
	id: number;
	whiteId: number;
	blackId: number;
	seasonId: number;
	week: number;
	status: number; // 0: pendiente, 1: programada, 2: completada, 3: cancelada
}

export interface PairingWithDetails extends WeeklyPairing {
	white: Player;
	black: Player;
	game?: Game;
}
