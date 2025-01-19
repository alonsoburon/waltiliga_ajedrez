// src/lib/server/db/index.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
	throw new Error('[DB] DATABASE_URL is not set');
}

const queryConfig = {
	prepare: false,
	ssl:
		process.env.NODE_ENV === 'production'
			? {
					rejectUnauthorized: false
				}
			: false
};

let _client: postgres.Sql<{}>;
let _db: ReturnType<typeof drizzle>;

function getDb() {
	if (!_db) {
		console.log('[DB] Initializing connection...');
		try {
			_client = postgres(connectionString, queryConfig);
			_db = drizzle(_client, { schema });
			console.log('[DB] Connection successful');
		} catch (error) {
			console.error('[DB] Connection failed:', error);
			throw error;
		}
	}
	return _db;
}

export const db = getDb();

export async function checkConnection() {
	try {
		const result = await _client`SELECT current_database()`;
		console.log('[DB] Connection test successful:', result[0]);
		return true;
	} catch (error) {
		console.error('[DB] Connection test failed:', error);
		return false;
	}
}

export async function closeConnection() {
	if (_client) {
		await _client.end();
		_client = undefined!;
		_db = undefined!;
		console.log('[DB] Connection closed');
	}
}
