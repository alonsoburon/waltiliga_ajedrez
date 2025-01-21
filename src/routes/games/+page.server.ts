// routes/games/+page.server.ts
import { db } from '$lib/server/db';
import { games, players, seasons } from '$lib/server/db/schema';
import { desc, eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

// Tipos
interface GameData {
	whiteId: number;
	blackId: number;
	result: number;
	seasonId: number;
	playedAt: Date;
	cond1: boolean;
	createdBy: number;
}

// Utilidades
function validateGame(data: GameData) {
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

function getSeasonWeek(gameDate: Date, seasonStart: Date): number {
	const msPerWeek = 1000 * 60 * 60 * 24 * 7;
	return Math.floor((gameDate.getTime() - seasonStart.getTime()) / msPerWeek) + 1;
}

async function processFormData(request: Request, userId: string): Promise<GameData> {
	const formData = await request.formData();
	return {
		whiteId: parseInt(formData.get('whiteId') as string),
		blackId: parseInt(formData.get('blackId') as string),
		result: parseInt(formData.get('result') as string),
		seasonId: parseInt(formData.get('seasonId') as string),
		playedAt: new Date(),
		cond1: formData.has('cond1'),
		createdBy: parseInt(userId)
	};
}

// Load
export const load = async ({ locals }) => {
	if (!locals?.auth?.user) {
		throw redirect(302, '/auth/login');
	}

	const [currentSeason, allPlayers, allGames] = await Promise.all([
		db.query.seasons.findFirst({
			where: eq(seasons.active, true)
		}),
		db.query.players.findMany({
			where: eq(players.active, true)
		}),
		db.query.games.findMany({
			with: {
				whitePlayer: true,
				blackPlayer: true,
				season: true
			},
			orderBy: (games, { desc }) => [desc(games.playedAt)]
		})
	]);

	return { games: allGames, players: allPlayers, currentSeason };
};

// Actions
// routes/games/+page.server.ts
export const actions = {
	create: async ({ request, locals }) => {
		if (!locals.auth?.user) {
			return fail(401, { error: 'No autorizado' });
		}

		try {
			const formData = await request.formData();
			console.log('Raw form data:', Object.fromEntries(formData));

			// Verificar campos requeridos
			const seasonId = parseInt(formData.get('seasonId') as string);
			const whiteId = parseInt(formData.get('whiteId') as string);
			const blackId = parseInt(formData.get('blackId') as string);
			const result = parseInt(formData.get('result') as string);
			const createdBy = locals.auth.user.id;

			if (isNaN(seasonId) || isNaN(whiteId) || isNaN(blackId) || isNaN(result)) {
				return fail(400, { error: 'Datos inválidos' });
			}

			// Obtener la temporada para calcular la semana
			const season = await db.query.seasons.findFirst({
				where: eq(seasons.id, seasonId)
			});

			if (!season) {
				return fail(400, { error: 'Temporada no encontrada' });
			}

			const playedAt = new Date();
			const week = getSeasonWeek(playedAt, new Date(season.startDate));

			// Crear el juego
			const [newGame] = await db
				.insert(games)
				.values({
					seasonId,
					whiteId,
					blackId,
					result,
					playedAt,
					week,
					createdBy,
					cond1: formData.has('cond1'),
					cond2: false,
					cond3: false,
					cond4: false,
					cond5: false
				})
				.returning();

			// Obtener el juego con relaciones
			const gameWithRelations = await db.query.games.findFirst({
				where: eq(games.id, newGame.id),
				with: {
					whitePlayer: true,
					blackPlayer: true,
					season: true
				}
			});

			if (!gameWithRelations) {
				throw new Error('Error al obtener el juego creado');
			}

			console.log('Game created successfully:', gameWithRelations);

			return {
				success: true,
				data: { game: gameWithRelations }
			};
		} catch (error) {
			console.error('Error al crear la partida:', error);
			return fail(500, {
				error: error instanceof Error ? error.message : 'Error al crear la partida'
			});
		}
	}
} satisfies Actions;
