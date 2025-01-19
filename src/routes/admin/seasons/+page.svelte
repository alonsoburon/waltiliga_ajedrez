<!-- src/routes/admin/seasons/+page.svelte -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';

	export let data: PageData;
	let showNewForm = false;
</script>

<div class="card p-4">
	<div class="flex justify-between items-center mb-4">
		<h1 class="text-2xl">Gestión de Temporadas</h1>
		<button class="btn variant-filled" on:click={() => (showNewForm = true)}>
			Nueva Temporada
		</button>
	</div>

	<table class="table w-full">
		<thead>
			<tr>
				<th>Nombre</th>
				<th>Descripción</th>
				<th>Inicio</th>
				<th>Fin</th>
				<th>Estado</th>
				<th>Acciones</th>
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
							<button class="btn variant-ghost" type="submit">
								{season.active ? '✅ Activa' : '❌ Inactiva'}
							</button>
						</form>
					</td>
					<td>
						<button class="btn variant-filled-secondary"> Editar </button>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>

	{#if showNewForm}
		<div class="modal" on:click|self={() => (showNewForm = false)}>
			<div class="modal-content card p-4">
				<h2 class="text-xl mb-4">Nueva Temporada</h2>
				<form
					method="POST"
					action="?/create"
					use:enhance={() => {
						return ({ result }) => {
							if (result.type === 'success') {
								showNewForm = false;
							}
						};
					}}
				>
					<div class="grid gap-4">
						<label class="label">
							<span>Nombre</span>
							<input name="name" class="input" required />
						</label>

						<label class="label">
							<span>Descripción</span>
							<textarea name="description" class="textarea"></textarea>
						</label>

						<label class="label">
							<span>Fecha Inicio</span>
							<input type="date" name="startDate" class="input" required />
						</label>

						<label class="label">
							<span>Fecha Fin</span>
							<input type="date" name="endDate" class="input" required />
						</label>

						<div class="flex justify-end gap-2">
							<button
								type="button"
								class="btn variant-ghost"
								on:click={() => (showNewForm = false)}
							>
								Cancelar
							</button>
							<button type="submit" class="btn variant-filled"> Crear </button>
						</div>
					</div>
				</form>
			</div>
		</div>
	{/if}
</div>

<style>
	.modal {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.modal-content {
		width: 100%;
		max-width: 500px;
		background: white;
	}
</style>
