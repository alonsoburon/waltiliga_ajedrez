// src/lib/server/db/reset.ts
import { db } from '.';
import { session, user } from './schema';

async function reset() {
	try {
		console.log('Limpiando tablas...');
		await db.delete(session);
		await db.delete(user);
		console.log('Tablas limpiadas');
	} catch (error) {
		console.error('Error:', error);
	}
}

reset();
