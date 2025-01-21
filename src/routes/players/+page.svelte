<!--/src/routes/players/+page.svelte -->
<script lang="ts">
	import type { PageData } from './$types';
	import PlayerCard from '$lib/components/PlayerCard.svelte';
	import { gamesStore } from '$lib/stores/games';
	import { playerStats } from '$lib/stores/playerStats';

	export let data: PageData;
	let filterDivision = 'all';

	// Debug
	console.log('🎲 Page Data:', {
		players: data.players?.length,
		games: data.games?.length,
		divisions: data.divisions?.length
	});

	// Inicializar stores solo si hay datos
	$: if (data?.games && data?.players) {
		console.log('📊 Inicializando stores con:', {
			games: data.games.length,
			players: data.players.length
		});
		gamesStore.setData(data.games, data.players);
		playerStats.setData(data.games, data.players);
	}

	$: filteredPlayers =
		filterDivision === 'all'
			? data.players
			: data.players?.filter((p) => p.divisionId === parseInt(filterDivision));

	// Debug
	$: console.log('🎯 Filtered Players:', filteredPlayers?.length);
</script>

<div class="container h-full mx-auto flex flex-col gap-8 p-4">
	<div class="flex justify-between items-center">
		<h2 class="h2 font-serif">Jugadores ({filteredPlayers?.length ?? 0})</h2>
		<select bind:value={filterDivision} class="select">
			<option value="all">Todas las divisiones</option>
			{#each data.divisions ?? [] as division}
				<option value={division.id}>{division.name}</option>
			{/each}
		</select>
	</div>

	{#if !data.players?.length}
		<p class="text-center opacity-75">No hay jugadores registrados</p>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{#each filteredPlayers ?? [] as player (player.id)}
				<PlayerCard {player} />
			{/each}
		</div>
	{/if}
</div>
