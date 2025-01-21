<!-- src/lib/components/SeasonModal.svelte -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import type { Season } from '$lib/server/db/schema';

	export let dialogElement: HTMLDialogElement;
	export let editMode = false;
	export let season: Partial<Season> | null = null;
	export let onClose: () => void;

	const defaultEndDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
		.toISOString()
		.split('T')[0];
</script>

<dialog bind:this={dialogElement} class="modal" on:close={onClose}>
	<div class="modal-content card variant-filled-surface p-4" role="document">
		<h2 class="h2 mb-4">{editMode ? 'Editar' : 'Nueva'} Temporada</h2>
		<form
			method="POST"
			action={editMode ? '?/update' : '?/create'}
			use:enhance={() => {
				return ({ result }) => {
					if (result.type === 'success') {
						onClose();
					}
				};
			}}
			class="space-y-4"
		>
			{#if editMode && season}
				<input type="hidden" name="id" value={season.id} />
			{/if}

			<!-- Nombre -->
			<label class="label">
				<span>Nombre</span>
				<input
					type="text"
					name="name"
					class="input variant-form-material"
					required
					placeholder="Temporada 1 2024"
					value={season?.name ?? ''}
				/>
			</label>

			<!-- Descripción -->
			<label class="label">
				<span>Descripción</span>
				<textarea
					name="description"
					class="textarea variant-form-material"
					required
					placeholder="Descripción de la temporada">{season?.description ?? ''}</textarea
				>
			</label>

			<!-- Fechas -->
			<div class="grid grid-cols-2 gap-4">
				<label class="label">
					<span>Fecha de inicio</span>
					<input
						type="date"
						name="startDate"
						class="input variant-form-material"
						required
						value={season?.startDate
							? new Date(season.startDate).toISOString().split('T')[0]
							: new Date().toISOString().split('T')[0]}
					/>
				</label>

				<label class="label">
					<span>Fecha de fin</span>
					<input
						type="date"
						name="endDate"
						class="input variant-form-material"
						required
						value={season?.endDate
							? new Date(season.endDate).toISOString().split('T')[0]
							: defaultEndDate}
					/>
				</label>
			</div>

			<div class="flex justify-end gap-2 mt-4">
				<button type="button" class="btn variant-ghost-surface" on:click={onClose}>
					Cancelar
				</button>
				<button type="submit" class="btn variant-filled-primary">
					{editMode ? 'Guardar' : 'Crear'}
				</button>
			</div>
		</form>
	</div>
</dialog>

<style>
	dialog {
		position: fixed;
		max-width: 32rem;
		padding: 0;
		border: none;
		border-radius: var(--theme-rounded-container);
		background: transparent;
	}

	dialog::backdrop {
		background: rgba(0, 0, 0, 0.5);
	}

	dialog[open] {
		display: grid;
		place-items: center;
	}

	.modal-content {
		width: 100%;
		max-width: 500px;
	}
</style>
