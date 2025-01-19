<!-- routes/rankings/+page.svelte -->
<script lang="ts">
	import type { PageData } from './$types';
	import PlayerStatsTable from '$lib/components/PlayerStatsTable.svelte';
	import { playerStats } from '$lib/stores/playerStats';

	export let data: PageData;

	// Inicializar store con los datos
	$: playerStats.setData(data.games, data.players);

	// Estado para filtros
	let selectedDivision = 'all';
	let showInactive = false;

	// Filtrar jugadores
	$: filteredPlayers = $playerStats
		.filter(
			(player) =>
				(showInactive || player.active) &&
				(selectedDivision === 'all' || player.divisionId === parseInt(selectedDivision))
		)
		.sort((a, b) => b.currentElo - a.currentElo);

	// Agrupar por división
	$: playersByDivision = data.divisions.reduce((acc, division) => {
		acc[division.id] = filteredPlayers.filter((player) => player.divisionId === division.id);
		return acc;
	}, {});
</script>

<div class="container mx-auto p-4 space-y-8">
	<header class="flex justify-between items-center">
		<h1 class="h1 font-serif">Rankings</h1>

		<div class="flex gap-4">
			<select bind:value={selectedDivision} class="select">
				<option value="all">Todas las divisiones</option>
				{#each data.divisions as division}
					<option value={division.id}>{division.name}</option>
				{/each}
			</select>

			<label class="flex items-center gap-2">
				<input type="checkbox" bind:checked={showInactive} class="checkbox" />
				Mostrar inactivos
			</label>
		</div>
	</header>

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
</div>
