// src/lib/server/db/index.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { DATABASE_URL } from '$env/static/private';
import * as schema from './schema'; // Añadir esta línea

const connectionString = DATABASE_URL;

// Codificar los caracteres especiales en la URL
const encodedConnectionString = connectionString.replace(
	/:([^/@]+)@/,
	(match, p1) => `:${encodeURIComponent(p1)}@`
);

const queryConfig = {
	prepare: false,
	ssl: process.env.NODE_ENV === 'production' ? 'require' : false
};

const client = postgres(encodedConnectionString, queryConfig);

export const db = drizzle(client, { schema }); // Añadir schema aquí
