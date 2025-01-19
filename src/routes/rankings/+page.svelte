<!-- routes/rankings/+page.svelte -->
<script lang="ts">
	import type { PageData } from './$types';
	import { calculateHistoricalElo } from '$lib/elo';

	export let data: PageData;

	// Estado para filtros
	let selectedDivision = 'all';
	let showInactive = false;

	// Calcular estadísticas para cada jugador
	$: playerStats = data.players.map((player) => {
		const playerGames = data.games.filter(
			(game) => game.whiteId === player.id || game.blackId === player.id
		);

		const wins = playerGames.filter(
			(game) =>
				(game.whiteId === player.id && game.result === 1) ||
				(game.blackId === player.id && game.result === -1)
		).length;

		const draws = playerGames.filter((game) => game.result === 0).length;
		const losses = playerGames.length - wins - draws;

		return {
			...player,
			currentElo: calculateHistoricalElo(data.games, data.players, player.id),
			gamesPlayed: playerGames.length,
			wins,
			draws,
			losses,
			winRate: playerGames.length > 0 ? ((wins / playerGames.length) * 100).toFixed(1) : '0'
		};
	});

	// Filtrar y ordenar jugadores
	$: filteredPlayers = playerStats
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
					<div class="table-container">
						<table class="table table-hover">
							<thead>
								<tr>
									<th>Pos</th>
									<th>Jugador</th>
									<th class="text-right">ELO</th>
									<th class="text-right">Δ ELO</th>
									<th class="text-right">PJ</th>
									<th class="text-right">V</th>
									<th class="text-right">E</th>
									<th class="text-right">D</th>
									<th class="text-right">%</th>
								</tr>
							</thead>
							<tbody>
								{#each playersByDivision[division.id] as player, i}
									<tr class="hover:variant-soft-surface">
										<td>{i + 1}</td>
										<td>
											<a href="/players/{player.id}" class="anchor">
												{player.name}
											</a>
										</td>
										<td class="text-right font-bold">{player.currentElo}</td>
										<td class="text-right">
											<span
												class={player.currentElo > player.startingElo
													? 'text-success-500'
													: player.currentElo < player.startingElo
														? 'text-error-500'
														: ''}
											>
												{player.currentElo - player.startingElo}
											</span>
										</td>
										<td class="text-right">{player.gamesPlayed}</td>
										<td class="text-right">{player.wins}</td>
										<td class="text-right">{player.draws}</td>
										<td class="text-right">{player.losses}</td>
										<td class="text-right">{player.winRate}%</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			{/if}
		{/each}
	{:else}
		<div class="card variant-filled-surface p-4">
			<div class="table-container">
				<table class="table table-hover">
					<thead>
						<tr>
							<th>Pos</th>
							<th>Jugador</th>
							<th class="text-right">ELO</th>
							<th class="text-right">Δ ELO</th>
							<th class="text-right">PJ</th>
							<th class="text-right">V</th>
							<th class="text-right">E</th>
							<th class="text-right">D</th>
							<th class="text-right">%</th>
						</tr>
					</thead>
					<tbody>
						{#each filteredPlayers as player, i}
							<tr class="hover:variant-soft-surface">
								<td>{i + 1}</td>
								<td>
									<a href="/players/{player.id}" class="anchor">
										{player.name}
									</a>
								</td>
								<td class="text-right font-bold">{player.currentElo}</td>
								<td class="text-right">
									<span
										class={player.currentElo > player.startingElo
											? 'text-success-500'
											: player.currentElo < player.startingElo
												? 'text-error-500'
												: ''}
									>
										{player.currentElo - player.startingElo}
									</span>
								</td>
								<td class="text-right">{player.gamesPlayed}</td>
								<td class="text-right">{player.wins}</td>
								<td class="text-right">{player.draws}</td>
								<td class="text-right">{player.losses}</td>
								<td class="text-right">{player.winRate}%</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/if}
</div>
