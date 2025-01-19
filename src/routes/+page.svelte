<script lang="ts">
	import type { PageData } from './$types';
	export let data: PageData;
</script>

<div class="space-y-8">
	<h1 class="h1 text-surface-900-50-token">Bienvenido, {data.user?.username}</h1>

	<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
		<a
			href="/games"
			class="card p-4 variant-filled-surface hover:variant-filled-primary transition-all"
		>
			<h2 class="h2">Partidas</h2>
			<p>Ver todas las partidas</p>
		</a>

		<a
			href="/players"
			class="card p-4 variant-filled-surface hover:variant-filled-primary transition-all"
		>
			<h2 class="h2">Jugadores</h2>
			<p>Ver todos los jugadores</p>
		</a>

		<a
			href="/rankings"
			class="card p-4 variant-filled-surface hover:variant-filled-primary transition-all"
		>
			<h2 class="h2">Rankings</h2>
			<p>Ver tabla de posiciones</p>
		</a>

		<a
			href="/calendar"
			class="card p-4 variant-filled-surface hover:variant-filled-primary transition-all"
		>
			<h2 class="h2">Calendario</h2>
			<p>Ver próximas partidas</p>
		</a>
	</div>
</div>
