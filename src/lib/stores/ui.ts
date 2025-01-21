// stores/ui.ts
import { writable } from 'svelte/store';

interface Notification {
	id: string;
	type: 'success' | 'error' | 'info';
	message: string;
}

interface UIState {
	loading: boolean;
	notifications: Notification[];
	filters: {
		divisionId: number | null;
		seasonId: number | null;
	};
}

function createUIStore() {
	const { subscribe, set, update } = writable<UIState>({
		loading: false,
		notifications: [],
		filters: {
			divisionId: null,
			seasonId: null
		}
	});

	return {
		subscribe,
		setLoading: (loading: boolean) => {
			update((state) => ({ ...state, loading }));
		},
		addNotification: (notification: Omit<Notification, 'id'>) => {
			const id = crypto.randomUUID();
			update((state) => ({
				...state,
				notifications: [...state.notifications, { ...notification, id }]
			}));

			// Auto-remove after 5 seconds
			setTimeout(() => {
				update((state) => ({
					...state,
					notifications: state.notifications.filter((n) => n.id !== id)
				}));
			}, 5000);
		},
		updateFilters: (filters: Partial<UIState['filters']>) => {
			update((state) => ({
				...state,
				filters: { ...state.filters, ...filters }
			}));
		}
	};
}

export const ui = createUIStore();
