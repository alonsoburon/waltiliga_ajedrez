<script lang="ts">
	import { calculateEloChange, calculateHistoricalElo } from '$lib/elo';
	import NewGameModal from '$lib/components/NewGameModal.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
	let showNewGameForm = false;

	$: gamesWithElo = data.games.map((game) => {
		const whiteElo = calculateHistoricalElo(data.games, data.players, game.whiteId, game.id);
		const blackElo = calculateHistoricalElo(data.games, data.players, game.blackId, game.id);
		const eloChange = calculateEloChange(whiteElo, blackElo, game.result);

		return {
			...game,
			whiteElo,
			blackElo,
			eloChange
		};
	});

	function formatDate(date: string) {
		return new Date(date)
			.toLocaleString('es-CL', {
				day: 'numeric',
				month: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			})
			.replace(',', '');
	}
</script>

<div class="container mx-auto p-4">
	<div class="flex justify-between items-center mb-6">
		<h1 class="h2">
			<span class="material-symbols-outlined">chess</span>
			Historial de Partidas
		</h1>
		<button class="btn variant-filled" on:click={() => (showNewGameForm = true)}>
			<span class="material-symbols-outlined">add_circle</span>
			Nueva Partida
		</button>
	</div>

	<div class="card p-0">
		<table class="table table-compact">
			<thead class="bg-surface-600">
				<tr>
					<th class="w-48">
						<!-- Columna jugador -->
						<div class="flex items-center gap-2">
							<span class="material-symbols-outlined pawn-white">chess_pawn</span>
							<span>Blancas</span>
						</div>
					</th>
					<th class="w-32 text-center">
						<!-- Columna ELO -->
						<div class="flex items-center justify-center gap-2">
							<span class="material-symbols-outlined" style="color: gold">star</span>
							<span>ELO</span>
						</div>
					</th>
					<th class="w-28 text-center">
						<!-- Columna resultado -->
						<div class="flex justify-center">Resultado</div>
					</th>
					<th class="w-32 text-center">
						<!-- Columna ELO -->
						<div class="flex items-center justify-center gap-2">
							<span class="material-symbols-outlined" style="color: gold">star</span>
							<span>ELO</span>
						</div>
					</th>
					<th class="w-48">
						<!-- Columna jugador -->
						<div class="flex items-center gap-2">
							<span class="material-symbols-outlined pawn-black">chess_pawn</span>
							<span>Negras</span>
						</div>
					</th>
					<th class="w-28 text-center">
						<!-- Columna fecha -->
						<div class="flex items-center justify-center">
							<span class="material-symbols-outlined">calendar_month</span>
						</div>
					</th>
					<th class="w-20 text-center">
						<!-- Columna Lettuce -->
						<div class="flex justify-center">Factor Lechuga</div>
					</th>
				</tr>
			</thead>
			<tbody>
				{#each gamesWithElo as game}
					<tr>
						<td>{game.whitePlayer.name}</td>
						<td class="text-center">
							{game.whiteElo}
							<span class={game.result === 1 ? 'text-success-500' : 'text-error-500'}>
								{game.result === 1 ? '+' : '-'}{Math.abs(game.eloChange)}
							</span>
						</td>
						<td class="text-center">
							{#if game.result === 1}
								<!-- White wins -->
								<div class="result-container">
									<span class="material-symbols-outlined pawn-white left-pawn"> chess_pawn </span>
									<span class="material-symbols-outlined crown" style="color: gold"> crown </span>
								</div>
							{:else if game.result === -1}
								<!-- Black wins -->
								<div class="result-container">
									<span class="material-symbols-outlined pawn-black right-pawn"> chess_pawn </span>
									<span class="material-symbols-outlined crown" style="color: gold"> crown </span>
								</div>
							{:else}
								<!-- Draw -->
								<span class="material-symbols-outlined" style="color: var(--color-surface-500)">
									balance
								</span>
							{/if}
						</td>
						<td class="text-center">
							{game.blackElo}
							<span class={game.result === -1 ? 'text-success-500' : 'text-error-500'}>
								{game.result === -1 ? '+' : '-'}{Math.abs(game.eloChange)}
							</span>
						</td>
						<td>{game.blackPlayer.name}</td>
						<td class="text-center">{formatDate(game.playedAt)}</td>
						<td class="text-center">
							{#if game.cond1}
								<span>🥬</span>
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<NewGameModal
		show={showNewGameForm}
		onClose={() => (showNewGameForm = false)}
		players={data.players}
		currentSeason={data.currentSeason}
		games={data.games}
	/>
</div>

<style lang="postcss">
	th {
		@apply text-sm opacity-75 p-3;
	}
	td {
		@apply p-3;
	}
	tr:hover {
		@apply bg-surface-600/20;
	}
	.material-symbols-outlined {
		font-variation-settings:
			'FILL' 1,
			'wght' 400,
			'GRAD' 0,
			'opsz' 24;
	}

	.result-container {
		position: relative;
		width: 90px;
		height: 24px;
		display: inline-block;
	}

	.crown {
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
	}

	.left-pawn {
		position: absolute;
		left: -5px;
	}

	.right-pawn {
		position: absolute;
		right: -5px;
	}

	.pawn-white {
		background-color: white;
		color: black;
		border-radius: 50%;
		padding: 2px;
	}

	.pawn-black {
		background-color: black;
		color: white;
		border-radius: 50%;
		padding: 2px;
	}
</style>
