<!-- src/routes/+layout.svelte -->
<script lang="ts">
	import '../app.postcss';
	import { AppShell, AppBar, initializeStores, Toast } from '@skeletonlabs/skeleton';
	import { page } from '$app/stores';
	import { LightSwitch } from '@skeletonlabs/skeleton';
	import { enhance } from '$app/forms';
	import {
		Chart,
		CategoryScale,
		LinearScale,
		PointElement,
		LineElement,
		Title,
		Tooltip,
		Legend,
		Filler,
		LineController // Añadido este
	} from 'chart.js';

	// Initialize Skeleton stores
	initializeStores();

	// Registrar los componentes de Chart.js
	Chart.register(
		CategoryScale,
		LinearScale,
		PointElement,
		LineElement,
		Title,
		Tooltip,
		Legend,
		Filler,
		LineController // Añadido este
	);

	// Configuración global de Chart.js
	Chart.defaults.color = '#fff';
	Chart.defaults.font.family = 'system-ui, sans-serif';
	Chart.defaults.responsive = true;
	Chart.defaults.maintainAspectRatio = false;
</script>

<Toast position="tr" />

<AppShell>
	<svelte:fragment slot="header">
		{#if $page.data.user}
			<AppBar>
				<svelte:fragment slot="lead">
					<strong class="text-xl font-serif">Waltiliga</strong>
				</svelte:fragment>
				<svelte:fragment slot="trail">
					<a href="/games" class="btn btn-sm variant-ghost-surface">Partidas</a>
					<a href="/players" class="btn btn-sm variant-ghost-surface">Jugadores</a>
					<a href="/rankings" class="btn btn-sm variant-ghost-surface">Rankings</a>
					<a href="/calendar" class="btn btn-sm variant-ghost-surface">Calendario</a>

					{#if $page.data.user.isAdmin}
						<a href="/admin" class="btn btn-sm variant-ghost-surface">Admin</a>
					{/if}
					<LightSwitch />
					<form
						action="/auth/logout"
						method="POST"
						use:enhance={() => {
							return async ({ result }) => {
								if (result.type === 'redirect') {
									window.location.href = result.location;
								}
							};
						}}
						class="inline-block"
					>
						<button type="submit" class="btn btn-sm variant-ghost-surface"> Logout </button>
					</form>
				</svelte:fragment>
			</AppBar>
		{/if}
	</svelte:fragment>

	<main class="container mx-auto p-4">
		<slot />
	</main>
</AppShell>
