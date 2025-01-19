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
