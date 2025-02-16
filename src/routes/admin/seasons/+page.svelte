<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';

	export let data: PageData;

	let showNewSeasonForm = false;
	let startDate = '';
	let endDate = '';
	let name = '';
	let description = '';

	function toggleNewSeasonForm() {
		showNewSeasonForm = !showNewSeasonForm;
	}
</script>

<div class="container mx-auto p-4 space-y-8">
	<header class="flex justify-between items-center">
		<h1 class="h1 font-serif">Gestión de Temporadas</h1>
		<button class="btn variant-filled-primary" on:click={toggleNewSeasonForm}>
			{showNewSeasonForm ? 'Cancelar' : 'Nueva Temporada'}
		</button>
	</header>

	{#if showNewSeasonForm}
		<div class="card variant-filled-surface p-4">
			<h2 class="h2 mb-4">Nueva Temporada</h2>
			<form method="POST" action="?/createSeason" use:enhance class="space-y-4">
				<label class="label">
					<span>Nombre</span>
					<input
						type="text"
						name="name"
						bind:value={name}
						class="input"
						placeholder="Verano 2024"
						required
					/>
				</label>

				<label class="label">
					<span>Descripción</span>
					<input
						type="text"
						name="description"
						bind:value={description}
						class="input"
						placeholder="Primera temporada del año"
					/>
				</label>

				<div class="grid grid-cols-2 gap-4">
					<label class="label">
						<span>Fecha de inicio</span>
						<input type="date" name="startDate" bind:value={startDate} class="input" required />
					</label>

					<label class="label">
						<span>Fecha de fin</span>
						<input type="date" name="endDate" bind:value={endDate} class="input" required />
					</label>
				</div>

				<button type="submit" class="btn variant-filled-primary w-full">Crear Temporada</button>
			</form>
		</div>
	{/if}

	<div class="card variant-filled-surface p-4">
		<h2 class="h2 mb-4">Temporadas Existentes</h2>
		<div class="table-container">
			<table class="table table-hover">
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
								<span class="badge {season.active ? 'variant-filled-success' : 'variant-filled-error'}">
									{season.active ? 'Activa' : 'Inactiva'}
								</span>
							</td>
							<td class="flex gap-2">
								<form method="POST" action="?/toggleSeason" use:enhance>
									<input type="hidden" name="seasonId" value={season.id} />
									<button class="btn variant-filled-warning">
										{season.active ? 'Desactivar' : 'Activar'}
									</button>
								</form>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
