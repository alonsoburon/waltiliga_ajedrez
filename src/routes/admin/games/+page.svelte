<!-- src/routes/games/+page.svelte -->
<script lang="ts">
	import type { PageData } from './$types';
	import NewGameModal from '$lib/components/NewGameModal.svelte';
	import { enhance } from '$app/forms';

	export let data: PageData;
	let dialogElement: HTMLDialogElement;
	let selectedPairing: any = null;
	let showModal = false;
	let selectedPairing: any = null;

	function openNewGameModal(pairing?: any) {
		selectedPairing = pairing;
		dialogElement?.showModal();
	}

	function openModal(pairing?: any) {
		selectedPairing = pairing;
		showModal = true;
	}

	function closeModal() {
		showModal = false;
		selectedPairing = null;
	}

	const RESULT_TEXT = {
		'-1': 'Victoria Negras',
		'0': 'Empate',
		'1': 'Victoria Blancas'
	};
</script>

<div class="container mx-auto p-4 space-y-8">
	<header class="flex justify-between items-center">
		<h1 class="h1 font-serif">Partidas</h1>
		{#if data.user}
			<button class="btn variant-filled-primary" on:click={() => openNewGameModal()}>
				Nueva Partida
			</button>
		{/if}
	</header>

	{#if data.pendingPairings.length > 0}
		<div class="card variant-filled-warning p-4">
			<h2 class="h2 mb-4">Partidas Pendientes</h2>
			<div class="grid gap-4">
				{#each data.pendingPairings as pairing}
					<div class="card variant-ghost p-4">
						<div class="flex justify-between items-center">
							<div class="grid grid-cols-3 gap-4 flex-1">
								<div class="text-right">
									<span class="font-bold">{pairing.white.name}</span>
								</div>
								<div class="text-center">
									<span class="font-bold">vs</span>
								</div>
								<div class="text-left">
									<span class="font-bold">{pairing.black.name}</span>
								</div>
							</div>
							<button class="btn variant-filled-primary" on:click={() => openNewGameModal(pairing)}>
								Registrar Resultado
							</button>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<div class="card variant-filled-surface p-4">
		<h2 class="h2 mb-4">Historial de Partidas</h2>
		<div class="grid gap-4">
			{#each data.games as game}
				<div class="card variant-ghost p-4">
					<div class="flex justify-between items-center">
						<div class="grid grid-cols-3 gap-4 flex-1">
							<div class="text-right">
								<span class="font-bold">{game.white.name}</span>
							</div>
							<div class="text-center">
								<span class="badge variant-filled">
									{RESULT_TEXT[game.result]}
								</span>
							</div>
							<div class="text-left">
								<span class="font-bold">{game.black.name}</span>
							</div>
						</div>
						<div class="text-sm opacity-75">
							{new Date(game.playedAt).toLocaleDateString()}
						</div>
						{#if data.user?.isAdmin}
							<form action="?/delete" method="POST" use:enhance class="ml-4">
								<input type="hidden" name="id" value={game.id} />
								<button
									type="submit"
									class="btn variant-ghost-error"
									onclick="return confirm('¿Estás seguro de eliminar esta partida?')"
								>
									Eliminar
								</button>
							</form>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>

{#if showModal}
    <NewGameModal
        {players}={data.players}
        {selectedPairing}
        onClose={closeModal}
    />
{/if}
