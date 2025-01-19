<!-- lib/components/AdminPlayerStats.svelte -->
<script lang="ts">
	import { playerStats } from '$lib/stores/playerStats';
	import PlayerStatsTable from '$lib/components/PlayerStatsTable.svelte';
	import AdminCrudTable from '$lib/components/AdminCrudTable.svelte';

	export let data: any;
	let showStats = false;

	const columns = [
		{ key: 'id', label: 'ID', type: 'number' },
		{ key: 'name', label: 'Nombre', type: 'text' },
		{ key: 'startingElo', label: 'ELO Inicial', type: 'number' },
		{
			key: 'divisionId',
			label: 'División',
			type: 'select',
			options: data.divisions.map((d) => ({
				value: d.id,
				label: d.name
			}))
		},
		{ key: 'active', label: 'Estado', type: 'checkbox' }
	];

	// Inicializar store con los datos
	$: playerStats.setData(data.games, data.players);

	// Ordenar por ELO actual
	$: sortedPlayers = $playerStats.sort((a, b) => b.currentElo - a.currentElo);
</script>

<div class="space-y-4">
	<div class="flex justify-between items-center">
		<h2 class="h2">Gestión de Jugadores</h2>
		<div class="flex gap-2">
			<button class="btn variant-ghost-surface" on:click={() => (showStats = !showStats)}>
				{showStats ? 'Ver Tabla de Edición' : 'Ver Estadísticas'}
			</button>
		</div>
	</div>

	{#if showStats}
		<div class="card variant-filled-surface p-4">
			<PlayerStatsTable players={sortedPlayers} showPosition={true} showDivision={true} />
		</div>
	{:else}
		<AdminCrudTable items={data.players} {columns} title="Jugadores" endpoint="/admin/players" />
	{/if}
</div>
