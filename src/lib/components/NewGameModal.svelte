<script lang="ts">
	import { enhance } from '$app/forms';
	import { calculateHistoricalElo } from '$lib/elo';
	import type { Player, Season, Game } from '$lib/types';

	export let show = false;
	export let onClose: () => void;
	export let players: Player[];
	export let currentSeason: Season;
	export let games: Game[];

	let selectedResult: number | null = null;
	let factorLechuga = false;
	let whiteId = '';
	let blackId = '';
</script>

{#if show}
	<div> class="modal-backdrop" <div/>
	<div class="modal" role="dialog">
		<div class="modal-content card p-6 w-modal shadow-xl">
			<header class="flex justify-between items-center mb-6">
				<h3 class="h3 flex items-center gap-2">
					<span class="material-symbols-outlined">add_circle</span>
					Nueva Partida
				</h3>
				<button class="btn-icon variant-ghost" on:click={onClose}>
					<span class="material-symbols-outlined">close</span>
				</button>
			</header>

			<form
				method="POST"
				use:enhance={() => {
					return async ({ result }) => {
						if (result.type === 'success') {
							onClose();
						}
					};
				}}
			>
				<div class="grid gap-6">
					<!-- Jugadores -->
					<div class="grid md:grid-cols-2 gap-4">
						<label class="label">
							<div class="flex items-center gap-2 mb-2">
								<span class="material-symbols-outlined pawn-white">chess_pawn</span>
								<span>Blancas</span>
							</div>
							<select name="whiteId" class="select" bind:value={whiteId} required>
								<option value="">Selecciona jugador</option>
								{#each players as player}
									<option value={player.id}>
										{player.name} ({calculateHistoricalElo(games, player.id)})
									</option>
								{/each}
							</select>
						</label>

						<label class="label">
							<div class="flex items-center gap-2 mb-2">
								<span class="material-symbols-outlined pawn-black">chess_pawn</span>
								<span>Negras</span>
							</div>
							<select name="blackId" class="select" bind:value={blackId} required>
								<option value="">Selecciona jugador</option>
								{#each players as player}
									<option value={player.id}>
										{player.name} ({calculateHistoricalElo(games, player.id)})
									</option>
								{/each}
							</select>
						</label>
					</div>

					<!-- Resultado -->
					<label class="label">
						<div class="flex items-center gap-2 mb-2">
							<span class="material-symbols-outlined" style="color: gold">trophy</span>
							<span>Resultado</span>
						</div>
						<div class="grid grid-cols-3 gap-2">
							<button
								type="button"
								class="btn variant-soft"
								class:variant-filled={selectedResult === 1}
								on:click={() => (selectedResult = 1)}
							>
								Victoria Blancas (1-0)
							</button>
							<button
								type="button"
								class="btn variant-soft"
								class:variant-filled={selectedResult === 0}
								on:click={() => (selectedResult = 0)}
							>
								Empate (½-½)
							</button>
							<button
								type="button"
								class="btn variant-soft"
								class:variant-filled={selectedResult === -1}
								on:click={() => (selectedResult = -1)}
							>
								Victoria Negras (0-1)
							</button>
						</div>
						<input type="hidden" name="result" value={selectedResult} />
					</label>

					<!-- Factor Lechuga -->
					<label class="label">
						<div class="flex items-center gap-2">
							<input type="checkbox" name="cond1" class="checkbox" bind:checked={factorLechuga} />
							<span>Factor Lechuga 🥬</span>
						</div>
					</label>

					<input type="hidden" name="seasonId" value={currentSeason?.id} />

					<!-- Botones -->
					<footer class="modal-footer flex justify-end gap-2">
						<button type="button" class="btn variant-ghost" on:click={onClose}> Cancelar </button>
						<button
							type="submit"
							class="btn variant-filled"
							disabled={!selectedResult || !whiteId || !blackId || whiteId === blackId}
						>
							Guardar Partida
						</button>
					</footer>
				</div>
			</form>
		</div>
	</div>
{/if}

<style>
	.modal {
		position: fixed;
		inset: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1000;
	}

	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(4px);
		z-index: 999;
	}
</style>
