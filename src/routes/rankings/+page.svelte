<script lang="ts">
	import type { PageData } from './$types';
	import PlayerStatsTable from '$lib/components/PlayerStatsTable.svelte';
	import { playerStats } from '$lib/stores/playerStats';
	import { seasons } from '$lib/stores/seasons';

	export let data: PageData;

	// Inicializar stores
	$: playerStats.setData(data.games, data.players);

	// Estado para filtros
	let selectedDivision: string = 'all';
	let selectedSeason: number | 'all' = 'all';
	let showInactive = false;

	// Reactive declarations
	$: filteredPlayers = $playerStats
		.filter((player) => {
			const divisionMatch =
				selectedDivision === 'all' || player.divisionId === parseInt(selectedDivision);
			const activeMatch = showInactive || player.active;
			return divisionMatch && activeMatch;
		})
		.sort((a, b) => {
			// Primero por ELO
			const eloDiff = b.currentElo - a.currentElo;
			if (eloDiff !== 0) return eloDiff;

			// Si tienen el mismo ELO, por porcentaje de victorias
			const winRateDiff = parseFloat(b.winRate) - parseFloat(a.winRate);
			if (winRateDiff !== 0) return winRateDiff;

			// Si todo es igual, por número de partidas
			return b.gamesPlayed - a.gamesPlayed;
		});

	// Agrupar por división para vista por divisiones
	$: playersByDivision = data.divisions.reduce(
		(acc, division) => {
			acc[division.id] = filteredPlayers.filter((player) => player.divisionId === division.id);
			return acc;
		},
		{} as Record<number, typeof filteredPlayers>
	);
</script>

<div class="container mx-auto p-4 space-y-8">
	<!-- Encabezado con filtros -->
	<div class="card variant-glass p-4">
		<header class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
			<h1 class="h1 font-serif">Rankings</h1>

			<div class="flex flex-col sm:flex-row gap-4">
				<select bind:value={selectedDivision} class="select">
					<option value="all">Todas las divisiones</option>
					{#each data.divisions as division}
						<option value={division.id}>{division.name}</option>
					{/each}
				</select>

				<select bind:value={selectedSeason} class="select">
					<option value="all">Todas las temporadas</option>
					{#each $seasons as season}
						<option value={season.id}>{season.name}</option>
					{/each}
				</select>

				<label class="flex items-center gap-2">
					<input type="checkbox" bind:checked={showInactive} class="checkbox" />
					<span>Mostrar inactivos</span>
				</label>
			</div>
		</header>

		<!-- Resumen de estadísticas -->
		<div class="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
			<div class="card variant-soft p-4 text-center">
				<div class="text-3xl font-bold">{filteredPlayers.length}</div>
				<div class="text-sm opacity-75">Jugadores</div>
			</div>
			<div class="card variant-soft p-4 text-center">
				<div class="text-3xl font-bold">
					{Math.round(
						filteredPlayers.reduce((acc, p) => acc + p.gamesPlayed, 0) / filteredPlayers.length
					)}
				</div>
				<div class="text-sm opacity-75">Promedio partidas</div>
			</div>
			<div class="card variant-soft p-4 text-center">
				<div class="text-3xl font-bold">
					{Math.round(
						filteredPlayers.reduce((acc, p) => acc + p.currentElo, 0) / filteredPlayers.length
					)}
				</div>
				<div class="text-sm opacity-75">ELO promedio</div>
			</div>
			<div class="card variant-soft p-4 text-center">
				<div class="text-3xl font-bold">
					{filteredPlayers[0]?.currentElo ?? 0}
				</div>
				<div class="text-sm opacity-75">ELO más alto</div>
			</div>
		</div>
	</div>

	<!-- Tabla de rankings -->
	{#if selectedDivision === 'all'}
		{#each data.divisions as division}
			{#if playersByDivision[division.id]?.length > 0}
				<div class="card variant-filled-surface p-4">
					<h2 class="h2 font-serif mb-4">{division.name}</h2>
					<PlayerStatsTable players={playersByDivision[division.id]} />
				</div>
			{/if}
		{/each}
	{:else}
		<div class="card variant-filled-surface p-4">
			<PlayerStatsTable players={filteredPlayers} />
		</div>
	{/if}

	<!-- Leyenda -->
	<div class="card variant-ghost p-4">
		<h3 class="h3 mb-2">Leyenda</h3>
		<div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
			<div>
				<strong>PJ:</strong> Partidas jugadas
				<br />
				<strong>V/E/D:</strong> Victorias/Empates/Derrotas
			</div>
			<div>
				<strong>V ⚪/⚫:</strong> Victorias con blancas/negras
				<br />
				<strong>Racha:</strong> Victorias consecutivas actuales
			</div>
			<div>
				<strong>Perf:</strong> Performance Rating
				<br />
				<strong>%:</strong> Porcentaje de victorias
			</div>
		</div>
	</div>
</div>
