// src/routes/games/+server.ts
import { error } from '@sveltejs/kit';

function validateGame(body: any) {
	if (body.whiteId === body.blackId) {
		throw error(400, 'Un jugador no puede jugar contra sí mismo');
	}
	if (![1, 0, -1].includes(body.result)) {
		throw error(400, 'Resultado inválido');
	}
	if (!body.seasonId) {
		throw error(400, 'Debe especificar una temporada');
	}
}

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();

		// Obtener ELOs actuales
		const [white, black] = await Promise.all([
			db.query.players.findFirst({ where: eq(players.id, body.whiteId) }),
			db.query.players.findFirst({ where: eq(players.id, body.blackId) })
		]);

		// Calcular cambios de ELO
		const { whiteChange, blackChange } = calculateEloChange(
			white.startingElo,
			black.startingElo,
			body.result
		);

		// Crear partida y actualizar ELOs en una transacción
		const result = await db.transaction(async (tx) => {
			// Crear partida
			const [game] = await tx
				.insert(games)
				.values({
					...body,
					whiteElo: white.startingElo,
					blackElo: black.startingElo,
					whiteEloChange: whiteChange,
					blackEloChange: blackChange
				})
				.returning();

			// Actualizar ELOs de jugadores
			await Promise.all([
				tx
					.update(players)
					.set({ startingElo: white.startingElo + whiteChange })
					.where(eq(players.id, body.whiteId)),
				tx
					.update(players)
					.set({ startingElo: black.startingElo + blackChange })
					.where(eq(players.id, body.blackId))
			]);

			return game;
		});

		return json(result);
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}
};
