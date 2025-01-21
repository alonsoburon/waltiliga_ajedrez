<script lang="ts">
	import type { PageData } from './$types';
	import { Chart } from 'chart.js';
	import { onMount } from 'svelte';
	import { seasons } from '$lib/stores/seasons';
	import { elo } from '$lib/stores/elo';
	import { gamesStore } from '$lib/stores/games';
	import EloChart from '$lib/components/EloChart.svelte';

	export let data: PageData;
	const { player, games, players, playerGames: initialPlayerGames } = data;

	// Estado local
	let selectedSeason: number | 'all' = 'all';

	// Inicialización de stores
	$: {
		if (games && players) {
			gamesStore.setData(games, players);
			elo.setData(games, players);
			seasons.setData(data.seasons, games);
		}
	}

	// Reactive declarations principales
	$: partidasFiltradas = seasons.filterBySeasonId(initialPlayerGames, selectedSeason);

	$: eloHistoryStore = elo.getPlayerEloHistory(player.id);
	$: currentSeasonName =
		selectedSeason !== 'all' ? $seasons.find((s) => s.id === selectedSeason)?.name : undefined;
	$: filteredEloHistory =
		selectedSeason === 'all'
			? $eloHistoryStore
			: $eloHistoryStore.filter((h) => h.seasonId === selectedSeason);

	$: currentStats = {
		wins: partidasFiltradas.filter(
			(g) =>
				(g.whiteId === player.id && g.result === 1) || (g.blackId === player.id && g.result === -1)
		).length,
		draws: partidasFiltradas.filter((g) => g.result === 0).length,
		get losses() {
			return partidasFiltradas.length - this.wins - this.draws;
		},
		get winRate() {
			return partidasFiltradas.length > 0
				? ((this.wins / partidasFiltradas.length) * 100).toFixed(1)
				: '0';
		}
	};

	// Helpers para la UI
	function getEloChangeClass(change: number): string {
		return change > 0 ? 'text-success-500' : change < 0 ? 'text-error-500' : 'text-surface-500';
	}

	function formatEloChange(change: number): string {
		return change > 0 ? `+${change}` : `${change}`;
	}

	function getGameResult(game: (typeof partidasFiltradas)[number], isWhite: boolean): string {
		if (game.result === 0) return 'Empate';
		if ((game.result === 1 && isWhite) || (game.result === -1 && !isWhite)) return 'Victoria';
		return 'Derrota';
	}

	function getResultClass(result: string): string {
		switch (result) {
			case 'Victoria':
				return 'variant-filled-success';
			case 'Derrota':
				return 'variant-filled-error';
			default:
				return 'variant-filled';
		}
	}
</script>

<div class="container mx-auto p-4 space-y-8">
	<!-- Cabecera del perfil -->
	<div class="card variant-filled-surface p-6">
		<div class="flex items-center gap-6">
			<div class="w-24 h-24 rounded-full bg-surface-300 flex items-center justify-center">
				<span class="text-4xl font-serif">{player.name[0]}</span>
			</div>
			<div>
				<h1 class="h1 font-serif">{player.name}</h1>
				<div class="flex gap-4 mt-2">
					<span class="badge variant-filled">{player.division.name}</span>
					<span class="badge variant-filled-primary">
						{Math.round(
							$gamesStore
								.filter((g) => g.whiteId === player.id || g.blackId === player.id)
								.sort((a, b) => b.id - a.id)
								.map((g) =>
									player.id === g.whiteId ? g.whiteEloChange.new : g.blackEloChange.new
								)[0] ?? player.startingElo
						)} ELO
					</span>
					<span class="badge {player.active ? 'variant-filled-success' : 'variant-filled-error'}">
						{player.active ? 'Activo' : 'Inactivo'}
					</span>
				</div>
			</div>
		</div>
	</div>

	<!-- Selector de temporada -->
	<div class="flex justify-end">
		<select bind:value={selectedSeason} class="select">
			<option value="all">Todas las temporadas</option>
			{#each $seasons as season}
				<option value={season.id}>{season.name}</option>
			{/each}
		</select>
	</div>

	<!-- Estadísticas y gráfico -->
	<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
		<!-- Panel de estadísticas -->
		<div class="card variant-ghost p-4 md:col-span-1">
			<h2 class="h3 font-serif mb-4">
				Estadísticas
				{#if selectedSeason !== 'all'}
					<span class="text-sm opacity-75">
						({$seasons.find((s) => s.id === selectedSeason)?.name})
					</span>
				{/if}
			</h2>
			<div class="space-y-4">
				<div class="grid grid-cols-2 gap-2">
					<div class="card variant-soft-success p-3 text-center">
						<div class="text-2xl font-bold">{currentStats.wins}</div>
						<div class="text-sm">Victorias</div>
					</div>
					<div class="card variant-soft-error p-3 text-center">
						<div class="text-2xl font-bold">{currentStats.losses}</div>
						<div class="text-sm">Derrotas</div>
					</div>
					<div class="card variant-soft p-3 text-center col-span-2">
						<div class="text-2xl font-bold">{currentStats.draws}</div>
						<div class="text-sm">Empates</div>
					</div>
				</div>
				<div class="card variant-soft-primary p-3">
					<div class="text-center">
						<div class="text-2xl font-bold">{currentStats.winRate}%</div>
						<div class="text-sm">Ratio de victoria</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Gráfico de progreso -->
		<div class="md:col-span-2">
			<EloChart eloHistory={filteredEloHistory} seasonName={currentSeasonName} />
		</div>
	</div>

	<!-- Últimas partidas -->
	<div class="card variant-ghost p-4">
		<h2 class="h2 font-serif mb-4">Partidas</h2>
		{#if partidasFiltradas.length > 0}
			<div class="space-y-2">
				{#each partidasFiltradas as game}
					{@const isWhite = game.whiteId === player.id}
					{@const eloChange = isWhite ? game.whiteEloChange?.change : game.blackEloChange?.change}
					<div class="card variant-soft p-3">
						<div class="flex justify-between items-center">
							<div class="flex flex-col">
								<div class="flex items-center gap-2">
									<span class="font-bold">
										vs {isWhite ? game.blackPlayer.name : game.whitePlayer.name}
									</span>
									<span class="text-sm opacity-75">
										(Temporada {game.season.name})
									</span>
								</div>
								<div class="flex items-center gap-2">
									<span class="text-sm opacity-75">
										{new Date(game.playedAt).toLocaleDateString()}
									</span>
									{#if eloChange !== undefined}
										<span class="text-sm {getEloChangeClass(eloChange)}">
											({formatEloChange(eloChange)})
										</span>
									{/if}
								</div>
							</div>
							<span class="badge {getResultClass(getGameResult(game, isWhite))}">
								{getGameResult(game, isWhite)}
							</span>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<p class="text-center opacity-75">No hay partidas registradas</p>
		{/if}
	</div>

	<!-- Footer -->
	<footer class="card-footer p-4">
		<a href="/players" class="btn variant-ghost-surface">Volver a jugadores</a>
	</footer>
</div>
