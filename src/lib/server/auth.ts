// src/lib/server/auth.ts
import { Lucia } from 'lucia';
import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle';
import { dev } from '$app/environment';
import { db } from './db';
import { user, session, key } from './db/schema';

const adapter = new DrizzlePostgreSQLAdapter(db, {
	user: user,
	session: session,
	key: key // Importante: añadir la tabla key
});

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		attributes: {
			secure: !dev
		}
	},
	getUserAttributes: (data) => {
		return {
			username: data.username,
			isAdmin: data.isAdmin
		};
	}
});

declare module 'lucia' {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: {
			username: string;
			isAdmin: boolean;
		};
	}
}
