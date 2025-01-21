<!-- lib/components/PlayerCard.svelte -->
<script lang="ts">
	import type { Player } from '$lib/types';
	import { gamesStore } from '../stores/games';
	import { playerStats } from '../stores/playerStats';

	export let player: Player;

	// Obtener stats del jugador
	$: playerStat = $playerStats?.find((p) => p.id === player.id);

	// Obtener el ELO actual usando el store derivado
	$: currentElo =
		$gamesStore
			.filter((g) => g.whiteId === player.id || g.blackId === player.id)
			.sort((a, b) => b.id - a.id)
			.map((g) => (player.id === g.whiteId ? g.whiteEloChange.new : g.blackEloChange.new))[0] ??
		player.startingElo;

	// Calcular el cambio de ELO
	$: eloChange = currentElo - player.startingElo;
</script>

<a
	href="/players/{player.id}"
	class="card variant-filled-surface hover:variant-soft-surface transition-all"
>
	<div class="p-4">
		<div class="flex items-center gap-4">
			<div class="w-12 h-12 rounded-full bg-surface-300 flex items-center justify-center">
				<span class="text-2xl font-serif">{player.name[0]}</span>
			</div>
			<div class="flex-1">
				<h3 class="h3 font-serif">{player.name}</h3>
				<div class="flex justify-between items-center">
					<span class="text-sm opacity-75">División {player.division.name}</span>
					<span class="badge variant-filled-primary">{Math.round(currentElo)} ELO</span>
				</div>
			</div>
		</div>

		<div class="mt-4">
			<div class="flex justify-between text-sm">
				<span
					>Record: {playerStat?.wins ?? 0}V - {playerStat?.draws ?? 0}E - {playerStat?.losses ??
						0}D</span
				>
				<span class={eloChange > 0 ? 'text-success-500' : eloChange < 0 ? 'text-error-500' : ''}>
					Δ {eloChange}
				</span>
			</div>
		</div>
	</div>
</a>
