<!-- routes/players/[id]/+page.svelte -->
<script lang="ts">
	import type { PageData } from './$types';
	import { calculateHistoricalElo } from '$lib/elo';

	export let data: PageData;
	const { player, games } = data;

	$: currentElo = calculateHistoricalElo(games, player.id, Infinity);
	$: recentGames = games.slice(0, 5);

	function getGameResult(game: any) {
		if (game.whiteId === player.id) {
			return game.result === 1 ? 'Victoria' : game.result === 0 ? 'Empate' : 'Derrota';
		} else {
			return game.result === -1 ? 'Victoria' : game.result === 0 ? 'Empate' : 'Derrota';
		}
	}

	function getOpponentName(game: any) {
		return game.whiteId === player.id ? game.blackPlayer.name : game.whitePlayer.name;
	}

	function getResultClass(result: string) {
		return result === 'Victoria'
			? 'variant-filled-success'
			: result === 'Derrota'
				? 'variant-filled-error'
				: 'variant-filled-surface';
	}
</script>

<div class="container mx-auto p-4">
	<div class="card variant-filled-surface">
		<header class="card-header p-4">
			<div class="flex items-center gap-4">
				<div class="w-16 h-16 rounded-full bg-surface-300 flex items-center justify-center">
					<span class="text-3xl font-serif">{player.name[0]}</span>
				</div>
				<div>
					<h1 class="h1 font-serif">{player.name}</h1>
					<p class="opacity-75">División {player.division.name}</p>
				</div>
			</div>
		</header>

		<section class="p-4">
			<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
				<!-- Estadísticas -->
				<div class="card variant-ghost p-4">
					<h2 class="h2 font-serif mb-4">Estadísticas</h2>
					<div class="space-y-4">
						<div class="flex justify-between items-center">
							<span>ELO Inicial</span>
							<span class="badge variant-filled">{player.startingElo}</span>
						</div>
						<div class="flex justify-between items-center">
							<span>ELO Actual</span>
							<span class="badge variant-filled-primary">{currentElo}</span>
						</div>
						<div class="flex justify-between items-center">
							<span>Estado</span>
							<span
								class="badge {player.active ? 'variant-filled-success' : 'variant-filled-error'}"
							>
								{player.active ? 'Activo' : 'Inactivo'}
							</span>
						</div>
						<div class="flex justify-between items-center">
							<span>Partidas jugadas</span>
							<span class="badge variant-filled">{games.length}</span>
						</div>
					</div>
				</div>

				<!-- Últimas partidas -->
				<div class="card variant-ghost p-4">
					<h2 class="h2 font-serif mb-4">Últimas partidas</h2>
					{#if games.length > 0}
						<div class="space-y-2">
							{#each recentGames as game}
								<div class="card variant-soft p-3">
									<div class="flex justify-between items-center">
										<div class="flex flex-col">
											<div class="flex items-center gap-2">
												<span class="font-bold">vs {getOpponentName(game)}</span>
												<span class="text-sm opacity-75">
													(Temporada {game.season.name})
												</span>
											</div>
											<span class="text-sm opacity-75">
												{new Date(game.playedAt).toLocaleDateString()}
											</span>
										</div>
										<span class="badge {getResultClass(getGameResult(game))}">
											{getGameResult(game)}
										</span>
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<p class="text-center opacity-75">No hay partidas registradas</p>
					{/if}
				</div>
			</div>
		</section>

		<footer class="card-footer p-4">
			<a href="/players" class="btn variant-ghost-surface"> Volver a jugadores </a>
		</footer>
	</div>
</div>
