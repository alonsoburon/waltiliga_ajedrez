<!-- src/routes/players/+page.svelte -->
<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;

	function calculateStats(player: any) {
		const totalGames = player.gamesAsWhite.length + player.gamesAsBlack.length;
		const wins =
			player.gamesAsWhite.filter((g) => g.result === 1).length +
			player.gamesAsBlack.filter((g) => g.result === -1).length;
		const draws =
			player.gamesAsWhite.filter((g) => g.result === 0).length +
			player.gamesAsBlack.filter((g) => g.result === 0).length;
		const losses = totalGames - wins - draws;

		return { games: totalGames, wins, draws, losses };
	}
</script>

<div class="container mx-auto p-4">
	<div class="flex justify-between items-center mb-6">
		<h1 class="text-2xl font-bold">Jugadores</h1>
	</div>

	<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
		{#each data.players as player}
			{@const stats = calculateStats(player)}
			<div class="card p-4">
				<h3 class="text-xl font-bold">{player.name}</h3>
				<div class="mt-2">
					<p>División: {player.division?.name || 'Sin división'}</p>
					<p>ELO inicial: {player.startingElo}</p>
					<div class="mt-2">
						<p>Partidas: {stats.games}</p>
						<p>V/E/D: {stats.wins}/{stats.draws}/{stats.losses}</p>
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>
