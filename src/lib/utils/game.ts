// src/lib/utils/game.ts
export interface GameData {
	whiteId: number;
	blackId: number;
	result: number;
	seasonId: number;
	playedAt: Date;
	cond1: boolean;
	createdBy: string | number;
}

export function validateGame(data: GameData) {
	const errors = [];
	if (data.whiteId === data.blackId) {
		errors.push('Un jugador no puede jugar contra sí mismo');
	}
	if (![1, 0, -1].includes(data.result)) {
		errors.push('Resultado inválido');
	}
	if (!data.seasonId) {
		errors.push('Debe especificar una temporada');
	}
	return errors;
}

export function getSeasonWeek(gameDate: Date, seasonStart: Date): number {
	const msPerWeek = 1000 * 60 * 60 * 24 * 7;
	return Math.floor((gameDate.getTime() - seasonStart.getTime()) / msPerWeek) + 1;
}
