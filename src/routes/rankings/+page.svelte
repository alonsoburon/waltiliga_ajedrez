<!-- src/routes/rankings/+page.svelte -->
<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;

	let selectedDivision: number | null = null;

	$: filteredRankings = selectedDivision
		? data.rankings.filter((p) => p.divisionId === selectedDivision)
		: data.rankings;
</script>

<div class="container mx-auto p-4">
	<div class="flex justify-between items-center mb-6">
		<h1 class="text-2xl font-bold">Ranking</h1>
		<select bind:value={selectedDivision} class="select">
			<option value={null}>Todas las divisiones</option>
			{#each data.divisions as division}
				<option value={division.id}>{division.name}</option>
			{/each}
		</select>
	</div>

	<div class="card">
		<table class="table w-full">
			<thead>
				<tr>
					<th>Pos</th>
					<th>Jugador</th>
					<th>División</th>
					<th>PJ</th>
					<th>PG</th>
					<th>PE</th>
					<th>PP</th>
					<th>Pts</th>
				</tr>
			</thead>
			<tbody>
				{#each filteredRankings as player, i}
					<tr>
						<td>{i + 1}</td>
						<td>{player.name}</td>
						<td>{player.division?.name || '-'}</td>
						<td>{player.stats.games}</td>
						<td>{player.stats.wins}</td>
						<td>{player.stats.draws}</td>
						<td>{player.stats.losses}</td>
						<td class="font-bold">{player.stats.points}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
