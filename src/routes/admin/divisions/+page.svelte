<!-- src/routes/admin/divisions/+page.svelte -->
<script lang="ts">
	import type { PageData } from './$types';
	import AdminCrudTable from '$lib/components/AdminCrudTable.svelte';

	export let data: PageData;

	const columns = [
		{ key: 'id', label: 'ID', type: 'number' },
		{ key: 'name', label: 'Nombre', type: 'text' },
		{ key: 'rank', label: 'Rango', type: 'number' }
	];
</script>

<AdminCrudTable
	items={data.divisions}
	{columns}
	title="Gestión de Divisiones"
	endpoint="/admin/divisions"
/>
