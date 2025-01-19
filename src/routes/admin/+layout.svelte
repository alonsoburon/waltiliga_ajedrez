<!-- src/routes/admin/+layout.svelte -->
<script lang="ts">
	import { page } from '$app/stores';
</script>

<div class="container mx-auto p-4">
	<div class="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-4">
		<!-- Sidebar -->
		<nav class="card variant-filled-surface p-4">
			<div class="flex flex-col gap-2">
				<a href="/admin" class="no-underline">
					<h2 class="h2 font-serif mb-4">Admin Panel</h2>
				</a>
				<a
					href="/admin/players"
					class="btn variant-ghost-surface {$page.url.pathname === '/admin/players'
						? 'variant-filled'
						: ''}"
				>
					Jugadores
				</a>
				<a
					href="/admin/games"
					class="btn variant-ghost-surface {$page.url.pathname === '/admin/games'
						? 'variant-filled'
						: ''}"
				>
					Partidas
				</a>
				<a
					href="/admin/divisions"
					class="btn variant-ghost-surface {$page.url.pathname === '/admin/divisions'
						? 'variant-filled'
						: ''}"
				>
					Divisiones
				</a>
			</div>
		</nav>

		<!-- Content -->
		<main class="card variant-filled-surface p-4">
			<slot />
		</main>
	</div>
</div>
