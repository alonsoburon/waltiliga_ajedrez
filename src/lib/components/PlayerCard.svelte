<!-- lib/components/PlayerCard.svelte -->
<script lang="ts">
	import { calculateHistoricalElo } from '$lib/elo';
	import type { Player, Game } from '$lib/types';

	export let player: Player;
	export let games: Game[];

	$: currentElo = calculateHistoricalElo(
		games,
		games.map((g) => g.whitePlayer || g.blackPlayer),
		player.id
	);
	$: playerGames = games.filter((game) => game.whiteId === player.id || game.blackId === player.id);
	$: wins = playerGames.filter(
		(game) =>
			(game.whiteId === player.id && game.result === 1) ||
			(game.blackId === player.id && game.result === -1)
	).length;
	$: draws = playerGames.filter((game) => game.result === 0).length;
	$: losses = playerGames.length - wins - draws;
</script>

<div class="card variant-filled-surface">
	<header class="card-header p-4">
		<div class="flex items-center gap-4">
			<div class="w-12 h-12 rounded-full bg-surface-300 flex items-center justify-center">
				<span class="text-2xl font-serif">{player.name[0]}</span>
			</div>
			<div>
				<h3 class="h3 font-serif">{player.name}</h3>
				<p class="text-sm opacity-75">División {player.division.name}</p>
			</div>
		</div>
	</header>

	<section class="p-4 space-y-2">
		<div class="flex justify-between">
			<span>ELO Inicial</span>
			<span class="font-bold">{player.startingElo}</span>
		</div>
		<div class="flex justify-between">
			<span>ELO Actual</span>
			<span class="font-bold">{currentElo}</span>
		</div>
		<div class="flex justify-between">
			<span>Δ ELO</span>
			<span
				class={currentElo > player.startingElo
					? 'text-success-500'
					: currentElo < player.startingElo
						? 'text-error-500'
						: ''}
			>
				{currentElo - player.startingElo}
			</span>
		</div>
		<div class="flex justify-between">
			<span>Record</span>
			<span>{wins}V - {draws}E - {losses}D</span>
		</div>
	</section>

	<footer class="card-footer p-4">
		<a href="/players/{player.id}" class="btn variant-ghost-surface w-full"> Ver detalles </a>
	</footer>
</div>
