// src/lib/server/db/seed-prod.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
	throw new Error('DATABASE_URL is not set');
}

const queryConfig = {
	prepare: false,
	ssl: {
		rejectUnauthorized: false
	}
};

const client = postgres(connectionString, queryConfig);
const db = drizzle(client, { schema });

async function seed() {
	try {
		// 1. Crear divisiones
		console.log('Creando divisiones...');
		const [gold, silver, bronze] = await db
			.insert(schema.divisions)
			.values([
				{ name: 'Gold', rank: 1 },
				{ name: 'Silver', rank: 2 },
				{ name: 'Bronze', rank: 3 }
			])
			.returning();

		// 2. Crear temporada inicial
		console.log('Creando temporada inicial...');
		await db.insert(schema.seasons).values({
			name: 'Temporada 1 2024',
			description: 'Primera temporada de la Waltiliga',
			startDate: '2024-01-01',
			endDate: '2024-06-30',
			active: true,
			prizeUrl: null
		});

		console.log('Seed completado exitosamente');
	} catch (error) {
		console.error('Error en seed:', error);
	} finally {
		await client.end();
	}
}

seed();
