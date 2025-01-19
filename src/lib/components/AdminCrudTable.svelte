<!-- lib/components/AdminCrudTable.svelte -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { Modal } from '@skeletonlabs/skeleton';

	export let items: any[];
	export let columns: {
		key: string;
		label: string;
		type: 'text' | 'number' | 'select' | 'checkbox' | 'badge';
		options?: { value: any; label: string }[];
		format?: (value: any) => string;
	}[];
	export let title: string;
	export let endpoint: string;

	let editingItem: any = null;
	let showAddForm = false;

	function startEdit(item: any) {
		editingItem = { ...item };
	}

	function cancelEdit() {
		editingItem = null;
	}

	function formatValue(value: any, column: (typeof columns)[0]) {
		if (value === undefined || value === null) return '';

		if (column.format) {
			return column.format(value);
		}
		if (column.type === 'badge') {
			return value ? 'Activo' : 'Inactivo';
		}
		if (column.type === 'select' && column.options) {
			return column.options.find((opt) => opt.value === value)?.label ?? value;
		}
		return value;
	}
</script>

<div class="space-y-4">
	<div class="flex justify-between items-center">
		<h2 class="h2">{title}</h2>
		<button class="btn variant-filled-primary" on:click={() => (showAddForm = true)}>
			Agregar
		</button>
	</div>

	<!-- Lista de items -->
	<div class="table-container">
		<table class="table table-hover">
			<thead>
				<tr>
					{#each columns as column}
						<th>{column.label}</th>
					{/each}
					<th>Acciones</th>
				</tr>
			</thead>
			<tbody>
				{#each items as item}
					{#if editingItem?.id === item.id}
						<tr>
							<td colspan={columns.length + 1}>
								<form method="POST" action="{endpoint}?/update" use:enhance class="flex gap-2">
									<input type="hidden" name="id" value={item.id} />

									{#each columns as column}
										{#if column.key !== 'id'}
											{#if column.type === 'text' || column.type === 'number'}
												<input
													type={column.type}
													name={column.key}
													bind:value={editingItem[column.key]}
													class="input"
												/>
											{:else if column.type === 'select'}
												<select
													name={column.key}
													bind:value={editingItem[column.key]}
													class="select"
												>
													{#each column.options || [] as option}
														<option value={option.value}>
															{option.label}
														</option>
													{/each}
												</select>
											{:else if column.type === 'checkbox'}
												<label class="flex items-center gap-2">
													<input
														type="checkbox"
														name={column.key}
														bind:checked={editingItem[column.key]}
														class="checkbox"
													/>
													{column.label}
												</label>
											{/if}
										{/if}
									{/each}

									<button type="submit" class="btn variant-filled-success"> Guardar </button>
									<button type="button" class="btn variant-filled-error" on:click={cancelEdit}>
										Cancelar
									</button>
								</form>
							</td>
						</tr>
					{:else}
						<tr>
							{#each columns as column}
								<td>
									{#if column.type === 'badge'}
										<span class="badge {getBadgeClass(item[column.key])}">
											{formatValue(item[column.key], column)}
										</span>
									{:else}
										{formatValue(item[column.key], column)}
									{/if}
								</td>
							{/each}
							<td class="flex gap-2">
								<button class="btn variant-ghost-warning btn-sm" on:click={() => startEdit(item)}>
									Editar
								</button>
								<form method="POST" action="{endpoint}?/delete" use:enhance>
									<input type="hidden" name="id" value={item.id} />
									<button type="submit" class="btn variant-ghost-error btn-sm"> Eliminar </button>
								</form>
							</td>
						</tr>
					{/if}
				{/each}
			</tbody>
		</table>
	</div>
</div>

<!-- Modal para agregar item usando Skeleton UI -->
<Modal bind:open={showAddForm}>
	<div class="card p-4 w-modal shadow-xl">
		<h3 class="h3 mb-4">Agregar {title}</h3>
		<form method="POST" action="{endpoint}?/add" use:enhance class="space-y-4">
			{#each columns as column}
				{#if column.key !== 'id'}
					<label class="label">
						<span>{column.label}</span>
						{#if column.type === 'text' || column.type === 'number'}
							<input type={column.type} name={column.key} class="input" required />
						{:else if column.type === 'select'}
							<select name={column.key} class="select" required>
								{#each column.options || [] as option}
									<option value={option.value}>
										{option.label}
									</option>
								{/each}
							</select>
						{:else if column.type === 'checkbox'}
							<input type="checkbox" name={column.key} class="checkbox" />
						{/if}
					</label>
				{/if}
			{/each}

			<div class="flex justify-end gap-2">
				<button type="button" class="btn variant-ghost" on:click={() => (showAddForm = false)}>
					Cancelar
				</button>
				<button type="submit" class="btn variant-filled-primary"> Agregar </button>
			</div>
		</form>
	</div>
</Modal>
