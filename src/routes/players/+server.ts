import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { players } from '$lib/server/db/schema';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const data = await request.json();

	const newPlayer = await db
		.insert(players)
		.values({
			name: data.name,
			startingElo: data.startingElo ?? 500,
			active: true,
			divisionId: data.divisionId
		})
		.returning();

	return json(newPlayer[0]);
};
