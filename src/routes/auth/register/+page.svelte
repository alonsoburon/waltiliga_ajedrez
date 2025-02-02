<script lang="ts">
    import { enhance } from '$app/forms';
    import type { ActionData, PageData } from './$types';
    import { onMount } from 'svelte';

    export let form: ActionData;
    export let data: PageData; // Recibir los datos de la página

    const players = data.players; // Asignar los jugadores a una variable local

    let successMessage = '';

    onMount(() => {
        if (form?.success) {
            successMessage = form.message;
            setTimeout(() => {
                window.location.href = '/'; // Redirigir al root después de 2 segundos
            }, 2000);
        }
    });
</script>

<div class="flex min-h-screen items-center justify-center">
    <div class="card p-8 w-full max-w-md">
        <h1 class="text-2xl font-bold mb-6 text-center">Registro</h1>

        {#if successMessage}
            <div class="alert variant-filled-success">
                {successMessage}
            </div>
        {/if}

        <form
            method="POST"
            use:enhance={() => {
                return async ({ result }) => {
                    if (result.type === 'success' && result.data) {
                        successMessage = result.data.message?.toString() || 'Registro exitoso';
                        setTimeout(() => {
                            window.location.href = '/';
                        }, 2000);
                    }
                };
            }}
        >
            {#if form?.message && !form?.success}
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

            <label class="label">
                <span>Jugador</span>
                <select name="playerId" class="select" required>
                    <option value="">Seleccionar jugador</option>
                    {#each players as player}
                        <option value={player.id}>{player.name}</option>
                    {/each}
                </select>
            </label>

            <button type="submit" class="btn variant-filled w-full"> Registrarse </button>
        </form>
    </div>
</div> 