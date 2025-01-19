// src/routes/admin/+page.server.ts
import { db } from '$lib/server/db';
import { players, games, divisions } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [activePlayers, totalGames, totalDivisions] = await Promise.all([
		db
			.select()
			.from(players)
			.where(eq(players.active, true))
			.then((results) => results.length),

		db
			.select()
			.from(games)
			.then((results) => results.length),

		db
			.select()
			.from(divisions)
			.then((results) => results.length)
	]);

	return {
		stats: {
			activePlayers,
			totalGames,
			totalDivisions
		}
	};
};
