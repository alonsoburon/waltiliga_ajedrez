<!-- src/routes/auth/login/+page.svelte -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	export let form: ActionData;
</script>

<div class="flex min-h-screen items-center justify-center">
	<div class="card p-8 w-full max-w-md">
		<h1 class="text-2xl font-bold mb-6 text-center">Login</h1>

		<form
			method="POST"
			use:enhance={() => {
				return async ({ result }) => {
					if (result.type === 'redirect') {
						window.location.href = result.location;
					}
				};
			}}
		>
			{#if form?.message}
				<div class="alert variant-filled-error">
					{form.message}
				</div>
			{/if}

			<label class="label">
				<span>Usuario</span>
				<input name="username" type="text" class="input" required />
			</label>

			<label class="label">
				<span>Contraseña</span>
				<input name="password" type="password" class="input" required />
			</label>

			<button type="submit" class="btn variant-filled w-full"> Ingresar </button>
		</form>

		<p class="text-center mt-4">
			¿No tienes una cuenta? <a href="/auth/register" class="link">Regístrate aquí</a>
		</p>
	</div>
</div>
