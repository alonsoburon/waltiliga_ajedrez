<!-- src/routes/admin/+layout.svelte -->
<script lang="ts">
	import type { LayoutData } from './$types';
	export let data: LayoutData;
</script>

<div class="container mx-auto p-4">
	<nav class="mb-6">
		<ul class="flex gap-4">
			<li><a href="/admin/seasons" class="btn variant-filled">Temporadas</a></li>
			<li><a href="/admin/players" class="btn variant-filled">Jugadores</a></li>
			<li><a href="/admin/divisions" class="btn variant-filled">Divisiones</a></li>
		</ul>
	</nav>

	<slot />
</div>
