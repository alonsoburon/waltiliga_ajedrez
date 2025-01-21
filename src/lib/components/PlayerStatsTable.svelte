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
				<tr class="border-b-2 border-surface-500/30">
					<th class="text-center py-3 font-semibold text-surface-300">Pos</th>
					<th class="text-left py-3 font-semibold text-surface-300">Jugador</th>
					<th class="text-center py-3 font-semibold text-surface-300">ELO</th>
					{#if showEloChange}
						<th class="text-center py-3 font-semibold text-surface-300" title="Cambio de ELO">Δ</th>
					{/if}
					<th class="text-center py-3 font-semibold text-surface-300" title="Partidas jugadas"
						>PJ</th
					>
					<th
						class="text-center py-3 font-semibold text-surface-300"
						title="Victorias/Empates/Derrotas"
					>
						<div class="flex items-center justify-center gap-1">
							<span>V</span>
							<span class="text-surface-400">/</span>
							<span>E</span>
							<span class="text-surface-400">/</span>
							<span>D</span>
						</div>
					</th>
					<th
						class="text-center py-3 font-semibold text-surface-300"
						title="Victorias con blancas/negras"
					>
						<div class="flex items-center justify-center gap-1">
							<span>⚪</span>
							<span class="text-surface-400">/</span>
							<span>⚫</span>
						</div>
					</th>
					<th class="text-center py-3 font-semibold text-surface-300" title="Racha actual">Racha</th
					>
					<th class="text-center py-3 font-semibold text-surface-300" title="Últimas 5 partidas"
						>Forma</th
					>
					{#if showPerformance}
						<th class="text-center py-3 font-semibold text-surface-300" title="Performance Rating"
							>Perf</th
						>
					{/if}
					<th
						class="text-center py-3 font-semibold text-surface-300"
						title="Porcentaje de victorias">%</th
					>
				</tr>
			</thead>
			<tbody>
				{#each players as player, i}
					<tr class="hover:bg-surface-600/20 border-b border-surface-500/20">
						<td class="text-center py-3">{i + 1}</td>
						<td class="py-3">
							<a
								href="/players/{player.id}"
								class="hover:underline flex items-center gap-2 text-primary-500"
							>
								<span class="font-medium">{player.name}</span>
								{#if !player.active}
									<span class="badge variant-filled-error text-xs">Inactivo</span>
								{/if}
							</a>
						</td>
						<td class="text-left font-bold py-3">
							{Math.round(player.currentElo)}
						</td>
						{#if showEloChange}
							<td class="text-left py-3 {getEloChangeClass(player.eloChange)}">
								{formatWithSign(Math.round(player.eloChange))}
							</td>
						{/if}
						<td class="text-left py-3 tabular-nums">
							{player.gamesPlayed}
						</td>
						<td class="text-center py-3 tabular-nums">
							<div class="flex items-center justify-center gap-1">
								<span class="text-success-400">{player.wins}</span>
								<span class="text-surface-400">/</span>
								<span class="text-surface-400">{player.draws}</span>
								<span class="text-surface-400">/</span>
								<span class="text-error-400">{player.losses}</span>
							</div>
						</td>
						<td class="text-center py-3 tabular-nums">
							<div class="flex items-center justify-center gap-1">
								<span title="Victorias con blancas">{player.winsAsWhite}</span>
								<span class="text-surface-400">/</span>
								<span title="Victorias con negras">{player.winsAsBlack}</span>
							</div>
						</td>
						<td class="text-center py-3">
							{#if player.winStreak > 0}
								<span class="badge bg-success-900 text-success-100 px-2 py-1 font-bold">
									{player.winStreak}
									<span class="ml-1">{getStreakEmoji(player.winStreak)}</span>
								</span>
							{/if}
						</td>
						<td class="text-center py-3">
							<div class="flex gap-1.5 justify-left items-center">
								{#each player.lastGames as result}
									<span class={getResultClass(result)} style="line-height: 0;">
										{getResultDot(result)}
									</span>
								{/each}
							</div>
						</td>
						{#if showPerformance}
							<td class="text-left py-3 tabular-nums">
								{#if player.performance > 0}
									{Math.round(player.performance)}
								{:else}
									<span class="text-surface-400">-</span>
								{/if}
							</td>
						{/if}
						<td class="text-left font-bold py-3 tabular-nums">
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
