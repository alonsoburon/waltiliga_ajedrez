// src/app.d.ts
/// <reference types="lucia" />
declare global {
	namespace App {
		interface Locals {
			auth: {
				user: import('lucia').User | null;
				session: import('lucia').Session | null;
			};
		}
	}

	namespace Lucia {
		type Auth = import('$lib/server/auth').Auth;
		type DatabaseUserAttributes = {
			username: string;
			isAdmin: boolean;
		};
		type DatabaseSessionAttributes = {};
	}
}

export {};
