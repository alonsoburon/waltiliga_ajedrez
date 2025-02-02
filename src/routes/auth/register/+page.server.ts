import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { db } from '$lib/server/db';
import { user, players } from '$lib/server/db/schema';
import { randomUUID } from 'crypto';
import pbkdf2 from 'pbkdf2';
import { promisify } from 'util';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

const pbkdf2Async = promisify(pbkdf2.pbkdf2);

async function hashPassword(password: string): Promise<string> {
    const salt = randomUUID();
    const iterations = 10000;
    const derivedKey = await pbkdf2Async(password, salt, iterations, 32, 'sha256');
    return `pbkdf2:sha256:${iterations}$${salt}$${derivedKey.toString('hex')}`;
}

export const actions: Actions = {
    default: async ({ request }) => {
        const formData = await request.formData();
        const username = formData.get('username') as string;
        const password = formData.get('password') as string;
        const playerId = parseInt(formData.get('playerId') as string);

        if (!username || !password || isNaN(playerId)) {
            return fail(400, { message: 'Todos los campos son requeridos' });
        }

        try {
            const existingUsers = await db.select().from(user).where(eq(user.username, username));
            const existingUser = existingUsers[0];

            if (existingUser) {
                return fail(400, { message: 'El nombre de usuario ya está en uso' });
            }

            const passwordHash = await hashPassword(password);

            // Verificar que el jugador existe
            const existingPlayers = await db.select().from(players).where(eq(players.id, playerId));
            const existingPlayer = existingPlayers[0];

            if (!existingPlayer) {
                return fail(400, { message: 'Jugador no encontrado' });
            }

            // Insertar el nuevo usuario con el playerId seleccionado
            await db.insert(user).values({
                id: randomUUID(),
                username,
                passwordHash,
                isAdmin: false,
                playerId: playerId
            });

            // Enviar un mensaje de éxito
            return { success: true, message: 'Usuario creado exitosamente' };
        } catch (error) {
            console.error('Error en el registro:', error);
            return fail(500, { message: 'Error en el registro' });
        }
    }
};

export const load: PageServerLoad = async () => {
    try {
        const allPlayers = await db.select().from(players).where(eq(players.active, true));
        console.log('Jugadores activos:', allPlayers);

        return {
            players: allPlayers
        };
    } catch (error) {
        console.error('Error al cargar jugadores:', error);
        return {
            players: []
        };
    }
}; 