<!-- src/routes/admin/games/+page.svelte -->
<script lang="ts">
	import type { PageData } from './$types';
	import AdminCrudTable from '$lib/components/AdminCrudTable.svelte';

	export let data: PageData;

	const columns = [
		{ key: 'id', label: 'ID', type: 'number' },
		{
			key: 'whiteId',
			label: 'Blancas',
			type: 'select',
			options: data.players.map((p) => ({
				value: p.id,
				label: p.name
			}))
		},
		{
			key: 'blackId',
			label: 'Negras',
			type: 'select',
			options: data.players.map((p) => ({
				value: p.id,
				label: p.name
			}))
		},
		{
			key: 'result',
			label: 'Resultado',
			type: 'select',
			options: [
				{ value: 1, label: 'Victoria Blancas' },
				{ value: 0, label: 'Empate' },
				{ value: -1, label: 'Victoria Negras' }
			]
		},
		{
			key: 'seasonId',
			label: 'Temporada',
			type: 'select',
			options: data.seasons.map((s) => ({
				value: s.id,
				label: s.name
			}))
		}
	];
</script>

<AdminCrudTable items={data.games} {columns} title="Gestión de Partidas" endpoint="/admin/games" />
