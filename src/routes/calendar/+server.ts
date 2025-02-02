// routes/calendar/+server.ts
import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { weeklyPairings, players, games } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	console.log('POST recibido en /calendar'); // Debug
	console.log('Usuario:', locals.auth?.user); // Debug

	if (!locals.auth?.user?.isAdmin) {
		console.log('Usuario no autorizado'); // Debug
		return new Response('No autorizado', { status: 401 });
	}

	try {
		const { seasonId, week } = await request.json();
		console.log('Datos recibidos:', { seasonId, week }); // Debug

		// Obtener jugadores activos
		const activePlayers = await db.query.players.findMany({
			where: eq(players.active, true)
		});
		console.log('Jugadores activos encontrados:', activePlayers.length); // Debug

		// Generar emparejamientos aleatorios (simplificado para prueba)
		const pairings = [];
		const availablePlayers = [...activePlayers];

		while (availablePlayers.length >= 2 && pairings.length < 3) {
			const white = availablePlayers.splice(
				Math.floor(Math.random() * availablePlayers.length),
				1
			)[0];
			const black = availablePlayers.splice(
				Math.floor(Math.random() * availablePlayers.length),
				1
			)[0];

			pairings.push({
				whiteId: white.id,
				blackId: black.id,
				week,
				seasonId,
				status: 0
			});
		}

		console.log('Emparejamientos generados:', pairings); // Debug

		// Insertar emparejamientos
		if (pairings.length > 0) {
			await db.insert(weeklyPairings).values(pairings);
		}

		return json({ success: true, pairings });
	} catch (error) {
		console.error('Error en generación de emparejamientos:', error); // Debug
		return new Response(error.message, { status: 500 });
	}
};
