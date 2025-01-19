// src/routes/auth/login/+page.server.ts
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { user, session } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import pbkdf2 from 'pbkdf2';
import { promisify } from 'util';
import { randomUUID } from 'crypto';

const pbkdf2Async = promisify(pbkdf2.pbkdf2);

async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
	try {
		const [algorithm, hashType, iterationsAndRest] = storedHash.split(':');
		const [iterations, salt, hash] = iterationsAndRest.split('$');

		const derivedKey = await pbkdf2Async(password, salt, parseInt(iterations), 32, 'sha256');
		const generatedHash = derivedKey.toString('hex');

		return generatedHash === hash;
	} catch (error) {
		console.error('[AUTH] Password verification error:', error);
		return false;
	}
}

export const actions = {
	default: async ({ request, cookies }) => {
		const formData = await request.formData();
		const username = formData.get('username');

		if (!username || !formData.get('password')) {
			return fail(400, { message: 'Usuario y contraseña son requeridos' });
		}

		try {
			console.log('[AUTH] Login attempt:', username);

			const existingUser = await db.query.user.findFirst({
				where: eq(user.username, username as string)
			});

			if (!existingUser) {
				console.log('[AUTH] Login failed: user not found:', username);
				return fail(400, { message: 'Usuario o contraseña incorrectos' });
			}

			const isValidPassword = await verifyPassword(
				formData.get('password') as string,
				existingUser.passwordHash
			);

			if (!isValidPassword) {
				console.log('[AUTH] Login failed: invalid password:', username);
				return fail(400, { message: 'Usuario o contraseña incorrectos' });
			}

			// Crear sesión
			const sessionId = randomUUID();
			const now = Date.now();
			const thirtyDays = 30 * 24 * 60 * 60 * 1000;

			await db.insert(session).values({
				id: sessionId,
				userId: existingUser.id,
				activeExpires: BigInt(now + thirtyDays),
				idleExpires: BigInt(now + thirtyDays)
			});

			cookies.set('auth_session', sessionId, {
				path: '/',
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'lax',
				maxAge: 60 * 60 * 24 * 30
			});

			console.log('[AUTH] Login successful:', username);
			throw redirect(302, '/');
		} catch (error) {
			// Solo loggear errores que no sean redirecciones
			if (!(error instanceof redirect)) {
				console.error('[AUTH] Login error:', {
					username,
					error: error instanceof Error ? error.message : 'Unknown error'
				});
				throw error;
			}
			throw error;
		}
	}
} satisfies Actions;

export const load = (async ({ locals }) => {
	if (locals.auth.user) {
		console.log('[AUTH] Usuario ya autenticado, redirigiendo:', {
			username: locals.auth.user.username
		});
		throw redirect(302, '/');
	}
	return {};
}) satisfies PageServerLoad;
