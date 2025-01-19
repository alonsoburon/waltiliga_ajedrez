<!-- src/routes/admin/seasons/+page.svelte -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';

	export let data: PageData;
	let dialogElement: HTMLDialogElement;

	function openModal() {
		dialogElement?.showModal();
	}

	function closeModal() {
		dialogElement?.close();
	}

	function handleClose() {
		closeModal();
	}
</script>

<div class="card p-4">
	<div class="flex justify-between items-center mb-4">
		<h1 class="text-2xl">Gestión de Temporadas</h1>
		<button class="btn variant-filled" on:click={openModal}> Nueva Temporada </button>
	</div>

	<table class="table w-full">
		<thead>
			<tr>
				<th scope="col">Nombre</th>
				<th scope="col">Descripción</th>
				<th scope="col">Inicio</th>
				<th scope="col">Fin</th>
				<th scope="col">Estado</th>
				<th scope="col">Acciones</th>
			</tr>
		</thead>
		<tbody>
			{#each data.seasons as season}
				<tr>
					<td>{season.name}</td>
					<td>{season.description}</td>
					<td>{new Date(season.startDate).toLocaleDateString()}</td>
					<td>{new Date(season.endDate).toLocaleDateString()}</td>
					<td>
						<form method="POST" action="?/toggleActive" use:enhance>
							<input type="hidden" name="id" value={season.id} />
							<input type="hidden" name="active" value={(!season.active).toString()} />
							<button
								class="btn variant-ghost"
								type="submit"
								aria-label={season.active ? 'Desactivar temporada' : 'Activar temporada'}
							>
								{season.active ? '✅ Activa' : '❌ Inactiva'}
							</button>
						</form>
					</td>
					<td>
						<button
							class="btn variant-filled-secondary"
							aria-label={`Editar temporada ${season.name}`}
						>
							Editar
						</button>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>

	<dialog bind:this={dialogElement} class="modal" on:close={handleClose}>
		<div class="modal-content card p-4" role="document">
			<h2 id="modal-title" class="text-xl mb-4">Nueva Temporada</h2>
			<form
				method="POST"
				action="?/create"
				use:enhance={() => {
					return ({ result }) => {
						if (result.type === 'success') {
							closeModal();
						}
					};
				}}
			>
				<!-- ... contenido del form ... -->
				<div class="flex justify-end gap-2">
					<button type="button" class="btn variant-ghost" on:click={closeModal}> Cancelar </button>
					<button type="submit" class="btn variant-filled"> Crear </button>
				</div>
			</form>
		</div>
	</dialog>
</div>

<style>
	dialog {
		position: fixed;
		max-width: 32rem;
		padding: 0;
		border: none;
		border-radius: var(--theme-border-radius);
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
		background: var(--theme-modal-bg);
		padding: 1rem;
	}
</style>
