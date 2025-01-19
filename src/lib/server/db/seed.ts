import { db } from '.';
import { divisions, seasons } from './schema';

async function seed() {
	try {
		// 1. Crear divisiones
		console.log('Creando divisiones...');
		const [gold, silver, bronze] = await db
			.insert(divisions)
			.values([
				{ name: 'Gold', rank: 1 },
				{ name: 'Silver', rank: 2 },
				{ name: 'Bronze', rank: 3 }
			])
			.returning();

		// 2. Crear temporada inicial
		console.log('Creando temporada inicial...');
		await db.insert(seasons).values({
			name: 'Temporada 1 2024',
			description: 'Primera temporada de la Waltiliga',
			startDate: '2024-01-01', // Como string en formato ISO
			endDate: '2024-06-30', // Como string en formato ISO
			active: true,
			divisionId: gold.id,
			prizeUrl: null
		});

		console.log('Seed completado exitosamente');
	} catch (error) {
		console.error('Error en seed:', error);
	}
}

seed();
