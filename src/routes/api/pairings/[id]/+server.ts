// src/routes/api/pairings/[id]/+server.ts
import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { weeklyPairings } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const PATCH: RequestHandler = async ({ params, request, locals }) => {
	if (!locals.auth?.user) {
		return new Response('No autorizado', { status: 401 });
	}

	try {
		const { status } = await request.json();
		const pairingId = parseInt(params.id);

		await db.update(weeklyPairings).set({ status }).where(eq(weeklyPairings.id, pairingId));

		return json({ success: true });
	} catch (error) {
		console.error('Error actualizando pairing:', error);
		return new Response(error instanceof Error ? error.message : 'Error desconocido', {
			status: 500
		});
	}
};
