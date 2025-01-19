<script lang="ts">
	import type { PageData } from './$types';
	import PlayerCard from '$lib/components/PlayerCard.svelte';

	export let data: PageData;
	let filterDivision = 'all';

	$: filteredPlayers =
		filterDivision === 'all'
			? data.players
			: data.players.filter((p) => p.divisionId === parseInt(filterDivision));
</script>

<div class="container h-full mx-auto flex flex-col gap-8 p-4">
	<div class="flex justify-between items-center">
		<h2 class="h2 font-serif">Jugadores</h2>
		<select bind:value={filterDivision} class="select">
			<option value="all">Todas las divisiones</option>
			{#each data.divisions as division}
				<option value={division.id}>{division.name}</option>
			{/each}
		</select>
	</div>

	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
		{#each filteredPlayers as player}
			<PlayerCard {player} games={data.games} />
		{/each}
	</div>
</div>
