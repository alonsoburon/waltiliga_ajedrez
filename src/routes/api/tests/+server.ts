// src/routes/api/test/+server.ts
import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { players } from '$lib/server/db/schema';

export async function GET() {
	try {
		const allPlayers = await db.select().from(players);
		return json(allPlayers);
	} catch (error) {
		console.error('Database error:', error);
		return json({ error: 'Database error' }, { status: 500 });
	}
}
