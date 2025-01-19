<!-- src/lib/components/PlayerStatsTable.svelte -->
<script lang="ts">
	import type { PlayerStats } from '$lib/stores/playerStats';

	export let players: PlayerStats[];
	export let showPosition = true;
	export let showDivision = false;
</script>

<div class="table-container">
	<table class="table table-hover">
		<thead>
			<tr>
				{#if showPosition}
					<th>Pos</th>
				{/if}
				<th>Jugador</th>
				{#if showDivision}
					<th>División</th>
				{/if}
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
			{#each players as player, i}
				<tr class="hover:variant-soft-surface">
					{#if showPosition}
						<td>{i + 1}</td>
					{/if}
					<td>
						<a href="/players/{player.id}" class="anchor">
							{player.name}
						</a>
					</td>
					{#if showDivision}
						<td>{player.division?.name}</td>
					{/if}
					<td class="text-right font-bold">{player.currentElo}</td>
					<td class="text-right">
						<span
							class={player.eloChange > 0
								? 'text-success-500'
								: player.eloChange < 0
									? 'text-error-500'
									: ''}
						>
							{player.eloChange}
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
