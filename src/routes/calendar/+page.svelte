<!-- routes/calendar/+page.svelte -->
<script lang="ts">
	import type { PageData } from './$types';
	import NewGameModal from '$lib/components/NewGameModal.svelte';
	import { seasons } from '$lib/stores/seasons';

	export let data: PageData;

	// Inicializar el store con los datos
	$: {
		console.log('Datos recibidos:', { season: data.season, games: data.games });
		if (data.seasons && data.games) {
			seasons.setData(data.seasons, data.games);
		}
	}

	// Debugear el store
	$: console.log('Estado del store:', $seasons);

	// Usar directamente data.season mientras arreglamos el store
	$: activeSeason = data.season;

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

	let showModal = false;
	let selectedPairing: any = null;

	function openModal(pairing?: any) {
		selectedPairing = pairing;
		showModal = true;
	}

	function closeModal() {
		showModal = false;
		selectedPairing = null;
	}
</script>

<div class="container mx-auto p-4 space-y-8">
	<header class="space-y-2">
		<h1 class="h1 font-serif">Calendario de Partidas</h1>
		{#if activeSeason}
			<div class="flex justify-between items-center">
				<div>
					<h2 class="h2">{activeSeason.name}</h2>
					<p class="opacity-75">{activeSeason.description}</p>
				</div>
				<div class="badge variant-filled-primary">
					Semana {data.currentWeek}
				</div>
			</div>
		{/if}
	</header>

	{#if activeSeason}
		<!-- Mis partidas -->
		<div class="space-y-4">
			<h3 class="h3 font-serif">Mis Partidas</h3>
			{#if data.myPairings.length > 0}
				<div class="card variant-filled-surface p-4">
					<div class="grid gap-4">
						{#each data.myPairings as pairing}
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
											<a href="/games/{pairing.game.id}" class="btn variant-ghost-surface">
												Ver partida
											</a>
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
			{#if data.otherPairings.length > 0}
				<div class="card variant-filled-surface p-4">
					<div class="grid gap-4">
						{#each data.otherPairings as pairing}
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
									{#if pairing.game}
										<a href="/games/{pairing.game.id}" class="btn variant-ghost-surface">
											Ver partida
										</a>
									{/if}
								</div>
							</div>
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
	bind:showModal
	pairing={selectedPairing}
	players={data.players}
	currentSeason={activeSeason}
	on:close={closeModal}
/>
