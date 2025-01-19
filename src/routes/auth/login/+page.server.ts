// src/routes/auth/login/+page.server.ts
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { lucia } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { user, session } from '$lib/server/db/schema'; // <-- Importar session
import { eq } from 'drizzle-orm';
import pbkdf2 from 'pbkdf2';
import { promisify } from 'util';
import { randomUUID } from 'crypto';

const pbkdf2Async = promisify(pbkdf2.pbkdf2);

async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
	try {
		const [algorithm, hashType, iterationsAndRest] = storedHash.split(':');
		const [iterations, salt, hash] = iterationsAndRest.split('$');

		console.log('Verificando contraseña:', {
			algorithm,
			hashType,
			iterations,
			salt: salt?.substring(0, 10) + '...',
			hashLength: hash?.length
		});

		const derivedKey = await pbkdf2Async(password, salt, parseInt(iterations), 32, 'sha256');

		const generatedHash = derivedKey.toString('hex');

		console.log('Comparación:', {
			generatedLength: generatedHash.length,
			expectedLength: hash.length,
			match: generatedHash === hash
		});

		return generatedHash === hash;
	} catch (error) {
		console.error('Error verificando contraseña:', error);
		return false;
	}
}

export const actions = {
	default: async ({ request, cookies }) => {
		const formData = await request.formData();
		const username = formData.get('username');
		const password = formData.get('password');

		try {
			const existingUser = await db.query.user.findFirst({
				where: eq(user.username, username as string)
			});

			if (!existingUser) {
				return fail(400, {
					message: 'Usuario o contraseña incorrectos'
				});
			}

			const passwordValid = await verifyPassword(password as string, existingUser.passwordHash);

			if (!passwordValid) {
				return fail(400, {
					message: 'Usuario o contraseña incorrectos'
				});
			}

			// Crear sesión manualmente
			const sessionId = randomUUID();
			const now = Date.now();
			const thirtyDays = 30 * 24 * 60 * 60 * 1000;

			await db.insert(session).values({
				id: sessionId,
				userId: existingUser.id,
				activeExpires: BigInt(now + thirtyDays),
				idleExpires: BigInt(now + thirtyDays)
			});

			// Establecer cookie
			cookies.set('auth_session', sessionId, {
				path: '/',
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'lax',
				maxAge: 60 * 60 * 24 * 30 // 30 días
			});

			throw redirect(302, '/');
		} catch (error) {
			console.error('Error en login:', error);
			return fail(500, {
				message: 'Error del servidor. Por favor, intenta más tarde.'
			});
		}
	}
} satisfies Actions;

export const load = (async ({ locals }) => {
	console.log('[DEBUG] Login page load, auth:', locals.auth);

	// Si ya hay sesión, redirigir al home
	if (locals.auth.user) {
		throw redirect(302, '/');
	}

	return {};
}) satisfies PageServerLoad;
