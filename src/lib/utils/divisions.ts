// src/lib/utils/divisions.ts
import { db } from '$lib/server/db';
import { players, games } from '$lib/server/db/schema';
import { calculateHistoricalElo } from '$lib/elo';
import { eq } from 'drizzle-orm';

export async function updateDivisions() {
	// 1. Obtener todos los jugadores activos y sus partidas
	const activePlayers = await db.query.players.findMany({
		where: eq(players.active, true)
	});

	const allGames = await db.query.games.findMany();

	// 2. Calcular ELO actual para cada jugador
	const playersWithElo = activePlayers.map((player) => ({
		...player,
		currentElo: calculateHistoricalElo(allGames, player.id, Infinity)
	}));

	// 3. Ordenar jugadores por ELO
	playersWithElo.sort((a, b) => b.currentElo - a.currentElo);

	// 4. Calcular los límites de cada tercio
	const totalPlayers = playersWithElo.length;
	const goldCount = Math.ceil(totalPlayers / 3);
	const silverCount = Math.ceil((totalPlayers - goldCount) / 2);

	// 5. Asignar divisiones
	const updates = playersWithElo.map((player, index) => {
		let divisionId;
		if (index < goldCount) {
			divisionId = 1; // Gold
		} else if (index < goldCount + silverCount) {
			divisionId = 2; // Silver
		} else {
			divisionId = 3; // Bronze
		}
		return {
			id: player.id,
			divisionId
		};
	});

	// 6. Actualizar en la base de datos
	for (const update of updates) {
		await db
			.update(players)
			.set({ divisionId: update.divisionId })
			.where(eq(players.id, update.id));
	}

	console.log('Divisiones actualizadas:', updates);
	return updates;
}
