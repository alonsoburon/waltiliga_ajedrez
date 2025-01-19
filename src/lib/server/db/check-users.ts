// src/lib/server/db/check-users.ts
import { db } from '.';
import { user } from './schema';

async function checkUsers() {
	try {
		const users = await db.select().from(user);

		console.log('Usuarios en la base de datos:');
		users.forEach((u) => {
			console.log({
				id: u.id,
				username: u.username,
				isAdmin: u.isAdmin,
				hashLength: u.passwordHash?.length
			});
		});
	} catch (error) {
		console.error('Error:', error);
	}
}

checkUsers();
