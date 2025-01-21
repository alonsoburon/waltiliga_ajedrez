<!-- src/lib/components/Modal.svelte -->
<script lang="ts">
    import { fade, scale } from 'svelte/transition';
    import { createEventDispatcher } from 'svelte';

    export let title: string;
    export let showModal: boolean;

    const dispatch = createEventDispatcher();

    function close() {
        dispatch('close');
    }
</script>

{#if showModal}
    <div 
        class="fixed inset-0 z-50"
        transition:fade={{ duration: 200 }}
    >
        <!-- Backdrop -->
        <div 
            class="fixed inset-0 bg-black/50 backdrop-blur-sm"
            on:click|self={close}
            transition:fade={{ duration: 200 }}
        />
        
        <!-- Modal -->
        <div 
            class="fixed inset-0 flex items-center justify-center p-4"
            transition:fade={{ duration: 200, delay: 100 }}
        >
            <div
                class="modal-container card variant-filled-surface w-full max-w-lg space-y-4"
                transition:scale={{ duration: 200 }}
            >
                <header class="flex items-center justify-between p-4">
                    <h3 class="h3 font-bold">{title}</h3>
                    <button 
                        class="btn-icon variant-soft hover:variant-filled-surface"
                        on:click={close}
                    >
                        ×
                    </button>
                </header>
                
                <div class="p-4">
                    <slot />
                </div>
            </div>
        </div>
    </div>
{/if}

<style lang="postcss">
    .modal-container {
        max-height: calc(100vh - 2rem);
        overflow-y: auto;
        @apply shadow-2xl;
    }
</style>