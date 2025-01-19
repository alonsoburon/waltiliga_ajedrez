<!-- routes/admin/players/+page.svelte -->
<script lang="ts">
	import type { PageData } from './$types';
	import AdminPlayerStats from '$lib/components/AdminPlayerStats.svelte';

	export let data: PageData;
</script>

<AdminPlayerStats {data} />
