<!-- NewGameModal.svelte -->
<!-- NewGameModal.svelte -->
<script lang="ts">
	import { enhance, type SubmitFunction } from '$app/forms';
	import { gamesStore } from '$lib/stores/games';
	import { getToastStore } from '@skeletonlabs/skeleton';
	import { fade } from 'svelte/transition';
	import type { Player, Season, Pairing, Game } from '$lib/types'; // Asegúrate de tener estos tipos definidos

	const toast = getToastStore();

	export let dialogElement: HTMLDialogElement;
	export let players: Player[];
	export let currentSeason: Season;
	export let onClose: () => void;
	export let pairing: Pairing | undefined = undefined;

	let whiteId = '';
	let blackId = '';
	let isSubmitting = false;
	let formError = '';

	$: if (pairing) {
		whiteId = String(pairing.whiteId);
		blackId = String(pairing.blackId);
	}

	$: samePlayerSelected = whiteId && blackId && whiteId === blackId;

	function closeModal(): void {
		whiteId = '';
		blackId = '';
		dialogElement?.close();
		onClose();
	}

	async function updatePairingStatus(pairingId: number): Promise<void> {
		try {
			const response = await fetch(`/api/pairings/${pairingId}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ status: 2 }) // 2 = Completada
			});

			if (!response.ok) {
				throw new Error('Error actualizando estado del pairing');
			}
		} catch (error) {
			console.error('Error en la actualización del pairing:', error);
			throw error;
		}
	}

	const handleSubmit: SubmitFunction = () => {
		return async ({ result }) => {
			isSubmitting = true;
			formError = '';

			try {
				console.log('Form submission result:', result);

				if (result.type === 'success') {
					const gameData = result.data?.game;
					console.log('Game data received:', gameData);

					if (gameData) {
						gamesStore.addGame(gameData);

						toast.trigger({
							message: '¡Partida guardada exitosamente!',
							background: 'variant-filled-success'
						});

						whiteId = '';
						blackId = '';
						dialogElement?.close();
						onClose();
						window.location.reload();
					}
				} else {
					formError = result.error || 'Error al guardar la partida';
					toast.trigger({
						message: formError,
						background: 'variant-filled-error'
					});
				}
			} catch (error) {
				console.error('Error en submit:', error);
				formError = 'Error inesperado';
				toast.trigger({
					message: 'Error inesperado al guardar la partida',
					background: 'variant-filled-error'
				});
			} finally {
				isSubmitting = false;
			}
		};
	};
</script>

<dialog bind:this={dialogElement} class="modal" on:close={closeModal}>
	<div class="modal-content card variant-filled-surface p-4">
		<h2 class="h2 mb-4">{pairing ? 'Registrar Partida' : 'Nueva Partida'}</h2>

		<!-- NewGameModal.svelte -->
		<form method="POST" action="?/create" use:enhance={handleSubmit} class="space-y-4">
			<input type="hidden" name="seasonId" value={currentSeason?.id} />
			{#if pairing}
				<input type="hidden" name="pairingId" value={pairing.id} />
				<!-- Agregar estos campos ocultos -->
				<input type="hidden" name="whiteId" value={pairing.whiteId} />
				<input type="hidden" name="blackId" value={pairing.blackId} />
			{/if}

			<!-- Debug para verificar valores en el template -->
			<!-- {JSON.stringify({ whiteId, blackId, pairing }, null, 2)} -->

			<label class="label">
				<span>Jugador Blancas</span>
				<select
					name="whiteId"
					class="select variant-form-material"
					bind:value={whiteId}
					required
					disabled={isSubmitting || !!pairing}
				>
					<option value="">Seleccionar jugador</option>
					{#each players as player}
						<option value={String(player.id)}>{player.name}</option>
					{/each}
				</select>
			</label>

			<label class="label">
				<span>Jugador Negras</span>
				<select
					name="blackId"
					class="select variant-form-material"
					bind:value={blackId}
					required
					disabled={isSubmitting || !!pairing}
				>
					<option value="">Seleccionar jugador</option>
					{#each players as player}
						<option value={String(player.id)}>{player.name}</option>
					{/each}
				</select>
			</label>

			{#if samePlayerSelected}
				<p class="text-error-500">No se puede seleccionar el mismo jugador para ambos colores</p>
			{/if}

			<label class="label">
				<span>Resultado</span>
				<select name="result" class="select variant-form-material" required disabled={isSubmitting}>
					<option value="1">Victoria Blancas</option>
					<option value="0">Tablas</option>
					<option value="-1">Victoria Negras</option>
				</select>
			</label>

			<label class="flex items-center space-x-2">
				<input type="checkbox" name="cond1" class="checkbox" disabled={isSubmitting} />
				<span>🥬?</span>
			</label>

			{#if formError}
				<div class="alert variant-filled-error" transition:fade>
					{formError}
				</div>
			{/if}

			<div class="flex justify-end gap-2">
				<button
					type="button"
					class="btn variant-ghost-surface"
					on:click={closeModal}
					disabled={isSubmitting}
				>
					Cancelar
				</button>
				<button
					type="submit"
					class="btn variant-filled-primary"
					disabled={samePlayerSelected || isSubmitting}
				>
					{#if isSubmitting}
						<div class="flex items-center gap-2">
							<span class="animate-spin">↻</span>
							<span>Guardando...</span>
						</div>
					{:else}
						Guardar
					{/if}
				</button>
			</div>
		</form>
	</div>
</dialog>

<style lang="postcss">
	dialog {
		@apply fixed max-w-xl p-0 border-none rounded-container-token bg-transparent;
	}

	dialog::backdrop {
		@apply bg-black/50;
	}

	dialog[open] {
		@apply grid place-items-center;
	}

	.modal-content {
		@apply w-full max-w-lg;
	}

	.text-error-500 {
		@apply text-red-500 text-sm;
	}

	.alert {
		@apply p-4 rounded-container-token;
	}

	.btn {
		@apply relative;
		transition: all 0.2s ease-in-out;
	}

	.btn:disabled {
		@apply opacity-50 cursor-not-allowed;
	}

	.btn:not(:disabled):hover {
		@apply transform scale-105;
	}

	.animate-spin {
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
</style>
