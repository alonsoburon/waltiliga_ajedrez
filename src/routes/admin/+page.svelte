<!-- src/routes/admin/+page.svelte -->
<script lang="ts">
	import type { PageData } from './$types';
	export let data: PageData;

	console.log('[DEBUG] Admin page data:', data);
</script>

<div class="space-y-8">
	<h1 class="h1 font-serif">Panel de Administración</h1>

	<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
		<div class="card variant-filled-surface p-4">
			<h3 class="h3">Jugadores Activos</h3>
			<p class="text-3xl font-bold">{data.stats.activePlayers}</p>
		</div>

		<div class="card variant-filled-surface p-4">
			<h3 class="h3">Partidas Totales</h3>
			<p class="text-3xl font-bold">{data.stats.totalGames}</p>
		</div>

		<div class="card variant-filled-surface p-4">
			<h3 class="h3">Divisiones</h3>
			<p class="text-3xl font-bold">{data.stats.totalDivisions}</p>
		</div>
	</div>

	<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
		<a
			href="/admin/players"
			class="card variant-ghost-surface p-4 hover:variant-filled-primary transition-all"
		>
			<h2 class="h2">Jugadores</h2>
			<p class="opacity-75">Gestionar jugadores y sus estados</p>
		</a>

		<a
			href="/admin/games"
			class="card variant-ghost-surface p-4 hover:variant-filled-primary transition-all"
		>
			<h2 class="h2">Partidas</h2>
			<p class="opacity-75">Administrar partidas y resultados</p>
		</a>

		<a
			href="/admin/divisions"
			class="card variant-ghost-surface p-4 hover:variant-filled-primary transition-all"
		>
			<h2 class="h2">Divisiones</h2>
			<p class="opacity-75">Configurar divisiones y rangos</p>
		</a>
	</div>
</div>
