// stores/auth.ts
import { writable } from 'svelte/store';

interface User {
	id: string;
	username: string;
	isAdmin: boolean;
}

interface AuthState {
	user: User | null;
	isAuthenticated: boolean;
	isAdmin: boolean;
}

function createAuthStore() {
	const { subscribe, set, update } = writable<AuthState>({
		user: null,
		isAuthenticated: false,
		isAdmin: false
	});

	return {
		subscribe,
		login: (user: User) => {
			set({
				user,
				isAuthenticated: true,
				isAdmin: user.isAdmin
			});
		},
		logout: () => {
			set({
				user: null,
				isAuthenticated: false,
				isAdmin: false
			});
		},
		updateUser: (userData: Partial<User>) => {
			update((state) => ({
				...state,
				user: state.user ? { ...state.user, ...userData } : null
			}));
		}
	};
}

export const auth = createAuthStore();
