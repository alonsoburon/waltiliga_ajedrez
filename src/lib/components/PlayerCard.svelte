<script lang="ts">
	import type { Player } from '$lib/types';
	import { calculateHistoricalElo } from '$lib/elo';

	export let player: Player;
	export let games: any[]; // Necesitamos recibir los juegos

	$: currentElo = calculateHistoricalElo(games, player.id, Infinity);
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
			<span>Estado</span>
			<span class={player.active ? 'text-success-500' : 'text-error-500'}>
				{player.active ? 'Activo' : 'Inactivo'}
			</span>
		</div>
	</section>

	<footer class="card-footer p-4">
		<a href="/players/{player.id}" class="btn variant-ghost-surface w-full"> Ver detalles </a>
	</footer>
</div>
