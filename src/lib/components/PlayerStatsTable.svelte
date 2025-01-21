<!-- lib/components/PlayerStatsTable.svelte -->
<script lang="ts">
	import type { PlayerStats } from '$lib/stores/playerStats';

	export let players: PlayerStats[];
	export let showEloChange = true;
	export let showPerformance = true;

	function getEloChangeClass(change: number): string {
		return change > 0 ? 'text-green-400' : change < 0 ? 'text-red-400' : 'text-surface-300';
	}

	function formatWithSign(number: number): string {
		return number > 0 ? `+${number}` : `${number}`;
	}

	function getStreakEmoji(streak: number): string {
		if (streak >= 7) return '🔥🔥';
		if (streak >= 5) return '🔥';
		if (streak >= 3) return '💪';
		return '';
	}

	function getResultDot(result: string): string {
		switch (result) {
			case 'W':
				return '●';
			case 'L':
				return '●';
			default:
				return '○';
		}
	}

	function getResultClass(result: string): string {
		switch (result) {
			case 'W':
				return 'text-green-400';
			case 'L':
				return 'text-red-400';
			default:
				return 'text-surface-300';
		}
	}
</script>

<div class="card variant-filled-surface">
	<div class="table-container">
		<table class="table">
			<thead>
				<tr>
					<th>Pos</th>
					<th>Jugador</th>
					<th class="text-right">ELO</th>
					{#if showEloChange}
						<th class="text-right" title="Cambio de ELO">Δ</th>
					{/if}
					<th class="text-center" title="Partidas jugadas">PJ</th>
					<th class="text-center" title="Victorias/Empates/Derrotas">V/E/D</th>
					<th class="text-center" title="Victorias con blancas/negras">⚪/⚫</th>
					<th class="text-center" title="Racha actual">Racha</th>
					<th class="text-center" title="Últimas 5 partidas">Forma</th>
					{#if showPerformance}
						<th class="text-right" title="Performance Rating">Perf</th>
					{/if}
					<th class="text-right" title="Porcentaje de victorias">%</th>
				</tr>
			</thead>
			<tbody>
				{#each players as player, i}
					<tr class="hover:bg-surface-600">
						<td>{i + 1}</td>
						<td>
							<a href="/players/{player.id}" class="hover:underline flex items-center gap-2">
								<span>{player.name}</span>
								{#if !player.active}
									<span class="badge variant-soft-error">Inactivo</span>
								{/if}
							</a>
						</td>
						<td class="text-right font-bold">{Math.round(player.currentElo)}</td>
						{#if showEloChange}
							<td class="text-right {getEloChangeClass(player.eloChange)}">
								{formatWithSign(Math.round(player.eloChange))}
							</td>
						{/if}
						<td class="text-center">{player.gamesPlayed}</td>
						<td class="text-center">
							<span class="text-green-400">{player.wins}</span>
							/<span class="text-surface-300">{player.draws}</span>
							/<span class="text-red-400">{player.losses}</span>
						</td>
						<td class="text-center">
							<span title="Victorias con blancas">{player.winsAsWhite}</span>
							/<span title="Victorias con negras">{player.winsAsBlack}</span>
						</td>
						<td class="text-center">
							{#if player.winStreak > 0}
								<span class="badge variant-filled-success">
									{player.winStreak}
									{getStreakEmoji(player.winStreak)}
								</span>
							{/if}
						</td>
						<td class="text-center">
							<div class="flex gap-1 justify-center items-center font-bold text-lg">
								{#each player.lastGames as result}
									<span class={getResultClass(result)}>
										{getResultDot(result)}
									</span>
								{/each}
							</div>
						</td>
						{#if showPerformance}
							<td class="text-right">
								{#if player.performance > 0}
									{Math.round(player.performance)}
								{:else}
									<span class="opacity-50">-</span>
								{/if}
							</td>
						{/if}
						<td class="text-right font-bold">
							{player.winRate}%
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<style>
	.table-container {
		overflow-x: auto;
		width: 100%;
	}

	.table {
		width: 100%;
		border-collapse: collapse;
	}

	.table th,
	.table td {
		padding: 0.75rem;
		white-space: nowrap;
	}

	.table th {
		font-weight: bold;
		text-align: left;
		@apply bg-surface-900/50;
	}

	.table tr:nth-child(even) {
		@apply bg-surface-800/50;
	}

	.table tr:nth-child(odd) {
		@apply bg-surface-700/50;
	}

	.table tr:not(:last-child) td {
		@apply border-b border-surface-600;
	}
</style>
