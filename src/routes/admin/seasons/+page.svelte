<!-- src/routes/admin/seasons/+page.svelte -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';
	import SeasonModal from '$lib/components/SeasonModal.svelte';

	export let data: PageData;
	let dialogElement: HTMLDialogElement;
	let editMode = false;
	let currentSeason: any = null;

	function openModal(season?: any) {
		editMode = !!season;
		currentSeason = season ? { ...season } : null;
		dialogElement?.showModal();
	}

	function closeModal() {
		dialogElement?.close();
		editMode = false;
		currentSeason = null;
	}
</script>

<div class="card p-4">
	<div class="flex justify-between items-center mb-4">
		<h1 class="text-2xl">Gestión de Temporadas</h1>
		<button class="btn variant-filled" on:click={() => openModal()}> Nueva Temporada </button>
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
							on:click={() => openModal(season)}
							aria-label={`Editar temporada ${season.name}`}
						>
							Editar
						</button>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>

	<SeasonModal bind:dialogElement {editMode} season={currentSeason} onClose={closeModal} />
</div>
