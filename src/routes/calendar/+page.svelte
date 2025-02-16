<!-- routes/calendar/+page.svelte -->
<script lang="ts">
	import type { PageData } from './$types';
	import NewGameModal from '$lib/components/NewGameModal.svelte';
	import { seasons } from '$lib/stores/seasons';
	import { gamesStore } from '$lib/stores/games';

	export let data: PageData;
	let dialogElement: HTMLDialogElement;
	let selectedPairing: any = null;

	// Inicializar el store con los datos
	$: {
		if (data.seasons && data.games) {
			seasons.setData(data.seasons, data.games);
			gamesStore.setData(data.games, data.players);
		}
	}

	// Usar season en lugar de activeSeason
	const { myPairings, otherPairings, season, isGenerating } = data;

	const STATUS = {
		0: 'Pendiente',
		1: 'Programada',
		2: 'Completada',
		3: 'Cancelada'
	};

	function getStatusClass(status: number) {
		switch (status) {
			case 0:
				return 'variant-ghost';
			case 1:
				return 'variant-filled-warning';
			case 2:
				return 'variant-filled-success';
			case 3:
				return 'variant-filled-error';
			default:
				return 'variant-ghost';
		}
	}

	function openModal(pairing?: any) {
		selectedPairing = pairing;
		dialogElement?.showModal();
	}

	function closeModal() {
		selectedPairing = null;
		dialogElement?.close();
	}
</script>

<div class="container mx-auto p-4 space-y-8">
	<header class="space-y-2">
		<h1 class="h1 font-serif">Calendario de Partidas</h1>
		{#if season}
			<div class="flex justify-between items-center">
				<div>
					<h2 class="h2">{season.name}</h2>
					<p class="opacity-75">{season.description}</p>
				</div>
				<div class="badge variant-filled-primary">
					Semana {data.currentWeek}
				</div>
			</div>
		{/if}
	</header>

	{#if isGenerating}
		<div class="card variant-ghost-warning p-4 text-center space-y-4">
			<div class="flex justify-center">
				<div class="spinner-border" role="status">
					<span class="sr-only">Generando emparejamientos...</span>
				</div>
			</div>
			<p class="font-bold">Generando emparejamientos para la semana {data.currentWeek}</p>
			<p class="text-sm opacity-75">
				Este proceso puede tardar unos momentos mientras se calculan los mejores emparejamientos
				basados en el historial de partidas y balance de colores.
			</p>
		</div>
	{/if}

	{#if season}
		<!-- Mis partidas -->
		<div class="space-y-4">
			<h3 class="h3 font-serif">Mis Partidas</h3>
			{#if myPairings?.length > 0}
				<div class="card variant-filled-surface p-4">
					<div class="grid gap-4">
						{#each myPairings as pairing}
							{#if pairing.white && pairing.black}
								<div class="card p-4 {getStatusClass(pairing.status)}">
									<div class="flex justify-between items-center">
										<div class="grid grid-cols-3 gap-4 flex-1">
											<div class="text-right">
												<span class="font-bold">{pairing.white.name}</span>
											</div>
											<div class="text-center">
												<span class="font-bold">vs</span>
												<div class="badge {getStatusClass(pairing.status)}">
													{STATUS[pairing.status]}
												</div>
											</div>
											<div class="text-left">
												<span class="font-bold">{pairing.black.name}</span>
											</div>
										</div>
										<div class="flex gap-2">
											{#if pairing.game}
												<span
													class="badge {gamesStore.getResultClass(
														gamesStore.getGameResult(pairing.game)
													)}"
												>
													{gamesStore.getGameResult(pairing.game)}
												</span>
											{:else}
												<button
													class="btn variant-filled-primary"
													on:click={() => openModal(pairing)}
												>
													Registrar partida
												</button>
											{/if}
										</div>
									</div>
								</div>
							{/if}
						{/each}
					</div>
				</div>
			{:else}
				<div class="card variant-ghost p-4 text-center">
					<p>Aún no tienes partidas asignadas para esta semana.</p>
				</div>
			{/if}
		</div>

		<!-- Otras partidas -->
		<div class="space-y-4">
			<h3 class="h3 font-serif">Otras Partidas</h3>
			{#if otherPairings?.length > 0}
				<div class="card variant-filled-surface p-4">
					<div class="grid gap-4">
						{#each otherPairings as pairing}
							{#if pairing.white && pairing.black}
								<div class="card p-4 {getStatusClass(pairing.status)}">
									<div class="flex justify-between items-center">
										<div class="grid grid-cols-3 gap-4 flex-1">
											<div class="text-right">
												<span class="font-bold">{pairing.white.name}</span>
											</div>
											<div class="text-center">
												<span class="font-bold">vs</span>
												<div class="badge {getStatusClass(pairing.status)}">
													{STATUS[pairing.status]}
												</div>
											</div>
											<div class="text-left">
												<span class="font-bold">{pairing.black.name}</span>
											</div>
										</div>
										<div class="flex gap-2">
											{#if pairing.game}
												<span
													class="badge {gamesStore.getResultClass(
														gamesStore.getGameResult(pairing.game)
													)}"
												>
													{gamesStore.getGameResult(pairing.game)}
												</span>
											{:else}
												<button
													class="btn variant-filled-primary"
													on:click={() => openModal(pairing)}
												>
													Registrar partida
												</button>
											{/if}
										</div>
									</div>
								</div>
							{/if}
						{/each}
					</div>
				</div>
			{:else}
				<div class="card variant-ghost p-4 text-center">
					<p>No hay otras partidas programadas para esta semana.</p>
				</div>
			{/if}
		</div>
	{:else}
		<div class="card variant-ghost p-8 text-center">
			<h2 class="h2 mb-4">No hay temporada activa</h2>
			<p>Contacta con un administrador para iniciar una nueva temporada.</p>
		</div>
	{/if}
</div>

<NewGameModal
	bind:dialogElement
	players={data.players}
	currentSeason={season}
	pairing={selectedPairing}
	onClose={closeModal}
/>

<style lang="postcss">
	.spinner-border {
		@apply inline-block w-8 h-8;
		border: 0.25em solid currentColor;
		border-right-color: transparent;
		border-radius: 50%;
		animation: spinner-border 0.75s linear infinite;
	}

	@keyframes spinner-border {
		to {
			transform: rotate(360deg);
		}
	}

	.sr-only {
		@apply absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0;
		clip: rect(0, 0, 0, 0);
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
</style>
