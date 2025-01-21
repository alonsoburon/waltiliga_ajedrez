// src/routes/games/+page.server.ts
import { db } from '$lib/server/db';
import { games, players, weeklyPairings } from '$lib/server/db/schema';
import { eq, and, or } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { updateDivisions } from '$lib/utils/divisions';

export const load = (async ({ locals }) => {
	const [allGames, activePlayers] = await Promise.all([
		db.query.games.findMany({
			with: {
				white: true,
				black: true,
				creator: true
			},
			orderBy: (games, { desc }) => [desc(games.playedAt)]
		}),
		db.query.players.findMany({
			where: eq(players.active, true),
			orderBy: (players, { asc }) => [asc(players.name)]
		})
	]);

	// Obtener emparejamientos pendientes si el usuario es el creador
	let pendingPairings = [];
	if (locals.auth?.user) {
		pendingPairings = await db.query.weeklyPairings.findMany({
			where: and(
				eq(weeklyPairings.gameId, null),
				or(
					eq(weeklyPairings.whiteId, parseInt(locals.auth.user.id)),
					eq(weeklyPairings.blackId, parseInt(locals.auth.user.id))
				)
			),
			with: {
				white: true,
				black: true
			}
		});
	}

	return {
		games: allGames,
		players: activePlayers, // Agregar esto
		pendingPairings,
		user: locals.auth?.user
	};
}) satisfies PageServerLoad;

export const actions = {
	create: async ({ request, locals }) => {
		if (!locals.auth?.user) {
			return fail(401, {
				error: 'No autorizado'
			});
		}

		try {
			const data = await request.formData();
			const whiteId = parseInt(data.get('whiteId') as string);
			const blackId = parseInt(data.get('blackId') as string);
			const result = parseInt(data.get('result') as string);
			const playedAt = new Date(data.get('playedAt') as string);
			const pairingId = data.get('pairingId') as string;

			// Validaciones
			if (!whiteId || !blackId || ![-1, 0, 1].includes(result) || !playedAt) {
				return fail(400, {
					error: 'Datos inválidos'
				});
			}

			// Crear la partida
			const [newGame] = await db
				.insert(games)
				.values({
					whiteId,
					blackId,
					result,
					playedAt,
					createdBy: locals.auth.user.id,
					seasonId: 1, // Ajustar según tu lógica de temporadas
					week: Math.ceil(
						(new Date().getTime() - new Date('2024-01-01').getTime()) / (7 * 24 * 60 * 60 * 1000)
					),
					cond1: data.get('cond1') === 'on',
					cond2: data.get('cond2') === 'on',
					cond3: data.get('cond3') === 'on',
					cond4: data.get('cond4') === 'on',
					cond5: data.get('cond5') === 'on'
				})
				.returning();

			// Si hay un pairingId, actualizar el emparejamiento
			if (pairingId) {
				await db
					.update(weeklyPairings)
					.set({
						gameId: newGame.id,
						status: 2 // Completado
					})
					.where(eq(weeklyPairings.id, parseInt(pairingId)));
			}

			// Actualizar divisiones después de crear el juego
			await updateDivisions();

			return { success: true, game: newGame };
		} catch (error) {
			console.error('Error creating game:', error);
			return fail(500, {
				error: 'Error al crear la partida'
			});
		}
	},

	delete: async ({ request, locals }) => {
		if (!locals.auth?.user?.isAdmin) {
			return fail(401, {
				error: 'No autorizado'
			});
		}

		try {
			const data = await request.formData();
			const gameId = parseInt(data.get('id') as string);

			// Primero limpiar la referencia en weekly_pairings si existe
			await db
				.update(weeklyPairings)
				.set({
					gameId: null,
					status: 0 // Volver a pendiente
				})
				.where(eq(weeklyPairings.gameId, gameId));

			// Luego eliminar el juego
			await db.delete(games).where(eq(games.id, gameId));

			// Actualizar divisiones después de eliminar el juego
			await updateDivisions();

			return { success: true };
		} catch (error) {
			console.error('Error deleting game:', error);
			return fail(500, {
				error: 'Error al eliminar la partida'
			});
		}
	},

	update: async ({ request, locals }) => {
		if (!locals.auth?.user?.isAdmin) {
			return fail(401, {
				error: 'No autorizado'
			});
		}

		try {
			const data = await request.formData();
			const gameId = parseInt(data.get('id') as string);
			const result = parseInt(data.get('result') as string);
			const playedAt = new Date(data.get('playedAt') as string);

			const [updatedGame] = await db
				.update(games)
				.set({
					result,
					playedAt,
					cond1: data.get('cond1') === 'on',
					cond2: data.get('cond2') === 'on',
					cond3: data.get('cond3') === 'on',
					cond4: data.get('cond4') === 'on',
					cond5: data.get('cond5') === 'on'
				})
				.where(eq(games.id, gameId))
				.returning();

			// Actualizar divisiones después de actualizar el juego
			await updateDivisions();

			return { success: true, game: updatedGame };
		} catch (error) {
			console.error('Error updating game:', error);
			return fail(500, {
				error: 'Error al actualizar la partida'
			});
		}
	}
} satisfies Actions;
