<!-- routes/admin/+page.svelte -->
<script lang="ts">
	import type { PageData } from './$types';
	import { admin } from '$lib/stores/admin';
	import PlayerStatsTable from '$lib/components/PlayerStatsTable.svelte';

	export let data: PageData;

	// Inicializar el store con todos los datos
	$: {
		admin.setData(data.divisions, data.players, data.games, data.seasons);
	}

	// Estado local para filtros
	let selectedDivision = 'all';
	let showInactive = false;

	// Stats generales del admin store
	$: stats = admin.stats;
	$: playersByDivision = admin.playersByDivision;
</script>

<div class="container mx-auto p-4 space-y-8">
	<!-- Encabezado -->
	<header class="space-y-2">
		<h1 class="h1 font-serif">Panel de Administración</h1>
		{#if $stats.season}
			<p class="opacity-75">Temporada activa: {$stats.season.name}</p>
		{/if}
	</header>

	<!-- Stats generales -->
	<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
		<div class="card variant-filled-surface p-4">
			<div class="text-center">
				<div class="text-3xl font-bold">{$stats.totalPlayers}</div>
				<div class="text-sm opacity-75">Jugadores totales</div>
			</div>
		</div>
		<div class="card variant-filled-surface p-4">
			<div class="text-center">
				<div class="text-3xl font-bold">{$stats.activePlayers}</div>
				<div class="text-sm opacity-75">Jugadores activos</div>
			</div>
		</div>
		<div class="card variant-filled-surface p-4">
			<div class="text-center">
				<div class="text-3xl font-bold">{$stats.averageElo}</div>
				<div class="text-sm opacity-75">ELO promedio</div>
			</div>
		</div>
		<div class="card variant-filled-surface p-4">
			<div class="text-center">
				<div class="text-3xl font-bold">{$stats.totalGames}</div>
				<div class="text-sm opacity-75">Partidas jugadas</div>
			</div>
		</div>
	</div>

	<!-- Filtros -->
	<div class="flex justify-end gap-4">
		<select bind:value={selectedDivision} class="select">
			<option value="all">Todas las divisiones</option>
			{#each $admin.divisions as division}
				<option value={division.id}>{division.name}</option>
			{/each}
		</select>

		<label class="flex items-center gap-2">
			<input type="checkbox" bind:checked={showInactive} class="checkbox" />
			Mostrar inactivos
		</label>
	</div>

	<!-- Rankings por división -->
	{#if selectedDivision === 'all'}
		{#each $admin.divisions as division}
			{#if $playersByDivision[division.id]?.length > 0}
				<div class="card variant-filled-surface p-4">
					<h2 class="h2 font-serif mb-4">{division.name}</h2>
					<PlayerStatsTable
						players={$playersByDivision[division.id].filter((p) => showInactive || p.active)}
						showPerformance={true}
					/>
				</div>
			{/if}
		{/each}
	{:else}
		<div class="card variant-filled-surface p-4">
			<PlayerStatsTable
				players={$playersByDivision[selectedDivision]?.filter((p) => showInactive || p.active) ??
					[]}
				showPerformance={true}
			/>
		</div>
	{/if}

	<!-- Panel de acciones administrativas -->
	<div class="card variant-ghost p-4 space-y-4">
		<h3 class="h3 font-serif">Acciones Administrativas</h3>
		<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
			<button class="btn variant-filled-primary"> Nueva Temporada </button>
			<button class="btn variant-filled-surface"> Gestionar Divisiones </button>
			<button class="btn variant-filled-surface"> Gestionar Jugadores </button>
		</div>
	</div>
</div>
