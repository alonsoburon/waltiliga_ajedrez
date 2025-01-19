// src/lib/server/db/reset-and-migrate.ts
import { db } from '.';
import { games, players, user, key, session, weeklyPairings, divisions, seasons } from './schema';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function resetAndMigrate() {
	try {
		// 1. Leer datos
		console.log('Leyendo datos...');
		const usuariosData = JSON.parse(
			readFileSync(join(__dirname, 'data', 'usuarios.json'), 'utf-8')
		);
		const jugadoresData = JSON.parse(
			readFileSync(join(__dirname, 'data', 'jugadores.json'), 'utf-8')
		);
		const partidasData = JSON.parse(
			readFileSync(join(__dirname, 'data', 'partidas.json'), 'utf-8')
		);

		// 2. Limpiar todo en orden (orden inverso de dependencias)
		console.log('Limpiando base de datos...');
		await db.delete(weeklyPairings);
		await db.delete(games);
		await db.delete(session);
		await db.delete(key);
		await db.delete(players);
		await db.delete(user);
		await db.delete(seasons);
		await db.delete(divisions);

		// 3. Crear divisiones
		console.log('Creando divisiones...');
		const [gold, silver, bronze] = await db
			.insert(divisions)
			.values([
				{ name: 'Gold', rank: 1 },
				{ name: 'Silver', rank: 2 },
				{ name: 'Bronze', rank: 3 }
			])
			.returning();

		// 4. Crear temporada inicial
		console.log('Creando temporada inicial...');
		const [season] = await db
			.insert(seasons)
			.values({
				name: 'Temporada 1 2024',
				description: 'Primera temporada de la Waltiliga',
				startDate: new Date('2024-01-01'),
				endDate: new Date('2024-06-30'),
				active: true
			})
			.returning();

		console.log('Temporada creada con ID:', season.id);

		// 5. Migrar usuarios y auth_keys
		console.log('Migrando usuarios...');
		await db.insert(user).values(
			usuariosData.map((userData) => ({
				id: userData.id.toString(),
				username: userData.username,
				isAdmin: userData.es_admin,
				passwordHash: userData.password_hash
			}))
		);

		console.log('Creando auth_keys...');
		await db.insert(key).values(
			usuariosData.map((userData) => ({
				id: `username:${userData.username}`,
				userId: userData.id.toString(),
				hashedPassword: userData.password_hash
			}))
		);

		// 6. Migrar jugadores
		console.log('Migrando jugadores...');
		await db.insert(players).values(
			jugadoresData.map((player) => ({
				id: player.id,
				name: `${player.nombre} ${player.apellido}`,
				startingElo: player.rating_inicial,
				active: true,
				divisionId: gold.id
			}))
		);

		// 7. Migrar partidas
		console.log('Migrando partidas...');
		await db.insert(games).values(
			partidasData.map((game) => ({
				whiteId: game.jugador_blancas_id,
				blackId: game.jugador_negras_id,
				result: game.resultado,
				playedAt: new Date(game.fecha_partida),
				week: 1,
				seasonId: season.id, // Usar el ID de la temporada que acabamos de crear
				createdBy: game.agregado_por.toString(),
				cond1: game.factor_lechuga,
				cond2: false,
				cond3: false,
				cond4: false,
				cond5: false
			}))
		);

		// 8. Verificación final
		console.log('\nVerificando migración...');
		const counts = {
			divisions: await db
				.select()
				.from(divisions)
				.then((r) => r.length),
			seasons: await db
				.select()
				.from(seasons)
				.then((r) => r.length),
			users: await db
				.select()
				.from(user)
				.then((r) => r.length),
			auth_keys: await db
				.select()
				.from(key)
				.then((r) => r.length),
			players: await db
				.select()
				.from(players)
				.then((r) => r.length),
			games: await db
				.select()
				.from(games)
				.then((r) => r.length)
		};

		console.log('Conteos finales:', counts);
	} catch (error) {
		console.error('Error:', error);
		throw error;
	}
}

resetAndMigrate();
