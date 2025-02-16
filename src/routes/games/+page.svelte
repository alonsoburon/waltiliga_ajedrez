<script lang="ts">
	import type { PageData } from './$types';
	import NewGameModal from '$lib/components/NewGameModal.svelte';
	import { gamesStore } from '$lib/stores/games';
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	export let data: PageData;
	let dialogElement: HTMLDialogElement;
	let selectedPairing: any = null; // Agregada esta línea

	$: gamesStore.setData(data.games, data.players);

	const openModal = () => dialogElement?.showModal();
	const closeModal = () => {
		selectedPairing = null; // Opcional: limpiar el pairing al cerrar
		dialogElement?.close();
	};

	onMount(() => {
		if (browser) {
			const params = new URLSearchParams(window.location.search);
			if (params.get('modal') === 'new') {
				const pairing = {
					whiteId: parseInt(params.get('whiteId')),
					blackId: parseInt(params.get('blackId')),
					id: parseInt(params.get('pairingId'))
				};
				selectedPairing = pairing;
				openModal();
			}
		}
	});
</script>

<div class="container mx-auto p-4">
	<div class="flex justify-between items-center mb-6">
		<h1 class="h2">
			<span class="material-symbols-outlined">chess</span>
			Historial de Partidas
		</h1>
		<button class="btn variant-filled" on:click={openModal}>
			<span class="material-symbols-outlined">add_circle</span>
			Nueva Partida
		</button>
	</div>

	<div class="card p-0">
		<table class="table table-compact">
			<thead class="bg-surface-600">
				<tr>
					<th class="w-48">
						<div class="flex items-center gap-2">
							<span class="material-symbols-outlined pawn-white">chess_pawn</span>
							<span>Blancas</span>
						</div>
					</th>
					<th class="w-48">
						<div class="flex items-center gap-2">
							<span class="material-symbols-outlined pawn-black">chess_pawn</span>
							<span>Negras</span>
						</div>
					</th>
					<th class="w-32 text-center">
						<div class="flex items-center justify-center gap-2">
							<span class="material-symbols-outlined" style="color: gold">star</span>
							<span>Resultado</span>
						</div>
					</th>
					<th class="w-32 text-center">Fecha</th>
					<th class="w-32 text-center">Temporada</th>
				</tr>
			</thead>
			<tbody>
				{#each $gamesStore as game (game.id)}
					<tr
						in:fade={{ duration: 300 }}
						out:fade={{ duration: 200 }}
						class="transition-all hover:bg-surface-600/20"
					>
						<td>
							<div class="flex items-center gap-2">
								<span class="font-bold">{game.whitePlayer.name}</span>
								<span class={gamesStore.getEloChange(game, true).className}>
									({gamesStore.getEloChange(game, true).text})
								</span>
							</div>
						</td>
						<td>
							<div class="flex items-center gap-2">
								<span class="font-bold">{game.blackPlayer.name}</span>
								<span class={gamesStore.getEloChange(game, false).className}>
									({gamesStore.getEloChange(game, false).text})
								</span>
							</div>
						</td>
						<td class="text-center">
							<span class="badge {gamesStore.getResultClass(gamesStore.getGameResult(game))}">
								{gamesStore.getGameResult(game)}
							</span>
						</td>
						<td class="text-center">
							{new Date(game.playedAt).toLocaleDateString()}
						</td>
						<td class="text-center">
							{game.season.name}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<NewGameModal
	bind:dialogElement
	players={data.players}
	currentSeason={data.currentSeason}
	onClose={closeModal}
/>

<style lang="postcss">
	th {
		@apply text-sm opacity-75 p-3;
	}

	td {
		@apply p-3;
	}

	.material-symbols-outlined {
		font-variation-settings:
			'FILL' 1,
			'wght' 400,
			'GRAD' 0,
			'opsz' 24;
	}

	.pawn-white {
		@apply bg-white text-black rounded-full p-0.5;
	}

	.pawn-black {
		@apply bg-black text-white rounded-full p-0.5;
	}

	.badge {
		@apply px-2 py-1 rounded;
	}

	.badge-white {
		@apply bg-white text-black border border-black;
	}

	.badge-black {
		@apply bg-black text-white;
	}

	.badge-draw {
		@apply bg-[#ffd700] text-black;
	}

	:global(.text-success-500) {
		@apply text-green-500;
	}

	:global(.text-error-500) {
		@apply text-red-500;
	}
</style>
