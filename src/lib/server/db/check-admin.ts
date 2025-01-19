// src/lib/server/db/check-admin.ts
import { db } from '.';
import { user } from './schema';
import { eq } from 'drizzle-orm';

async function checkAdmin() {
	try {
		const adminUsers = await db.select().from(user).where(eq(user.isAdmin, true));

		if (adminUsers.length === 0) {
			console.log('No hay usuarios admin');
		} else {
			console.log('Usuarios admin encontrados:');
			adminUsers.forEach((admin) => {
				console.log({
					id: admin.id,
					username: admin.username,
					isAdmin: admin.isAdmin
				});
			});
		}
	} catch (error) {
		console.error('Error:', error);
	}
}

checkAdmin();
