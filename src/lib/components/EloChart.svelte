<!-- src/lib/components/EloChart.svelte -->
<script lang="ts">
	import { Chart } from 'chart.js';
	import { onMount } from 'svelte';
	import type { EloHistoryEntry } from '$lib/types';

	// Props
	export let eloHistory: EloHistoryEntry[] = [];
	export let title = 'Progreso de ELO';
	export let seasonName: string | undefined = undefined;

	// Estado local
	let chartCanvas: HTMLCanvasElement;
	let chart: Chart | undefined;

	// Debug logs
	$: console.log('EloChart - eloHistory:', eloHistory);
	$: console.log('EloChart - seasonName:', seasonName);

	function createChartConfig() {
		if (!eloHistory.length) {
			console.log('No hay datos de ELO para mostrar');
			return null;
		}

		console.log('Creando configuración del gráfico');
		const minElo = Math.min(...eloHistory.map((h) => h.elo));
		const maxElo = Math.max(...eloHistory.map((h) => h.elo));

		console.log('Rango de ELO:', { minElo, maxElo });

		const config = {
			type: 'line' as const,
			data: {
				labels: eloHistory.map((h) => new Date(h.date).toLocaleDateString('es-ES')),
				datasets: [
					{
						label: 'ELO',
						data: eloHistory.map((h) => h.elo),
						fill: true,
						backgroundColor: 'rgba(255, 159, 64, 0.2)',
						borderColor: 'rgb(255, 159, 64)',
						borderWidth: 2,
						tension: 0.4,
						pointRadius: 4,
						pointHoverRadius: 6,
						pointBackgroundColor: 'rgb(255, 159, 64)',
						pointBorderColor: '#fff',
						pointBorderWidth: 2
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: { display: false },
					tooltip: {
						mode: 'index',
						intersect: false,
						backgroundColor: 'rgba(0, 0, 0, 0.8)',
						titleColor: 'rgb(255, 159, 64)',
						titleFont: { weight: 'bold' },
						bodyFont: { size: 14 },
						padding: 12,
						callbacks: {
							title: (tooltipItems) => {
								const date = new Date(eloHistory[tooltipItems[0].dataIndex].date);
								return date.toLocaleDateString('es-ES', {
									year: 'numeric',
									month: 'long',
									day: 'numeric'
								});
							},
							label: (context) => {
								const idx = context.dataIndex;
								const change = eloHistory[idx].change;
								const sign = change > 0 ? '+' : '';
								return [`ELO: ${context.raw}`, `Cambio: ${sign}${change}`];
							}
						}
					}
				},
				scales: {
					x: {
						grid: {
							color: 'rgba(255, 255, 255, 0.1)',
							display: false
						},
						ticks: {
							color: 'rgba(255, 255, 255, 0.7)',
							maxRotation: 45,
							minRotation: 45,
							font: { size: 11 }
						}
					},
					y: {
						min: Math.floor((minElo - 50) / 50) * 50,
						max: Math.ceil((maxElo + 50) / 50) * 50,
						grid: {
							color: 'rgba(255, 255, 255, 0.1)'
						},
						ticks: {
							color: 'rgba(255, 255, 255, 0.7)',
							stepSize: 50,
							font: { size: 12 }
						}
					}
				}
			}
		};

		console.log('Configuración creada:', config);
		return config;
	}

	// Actualizar el gráfico cuando cambian los datos
	$: if (chartCanvas && eloHistory.length) {
		console.log('Intentando crear/actualizar el gráfico');
		const ctx = chartCanvas.getContext('2d');
		if (ctx) {
			console.log('Contexto del canvas obtenido');
			if (chart) {
				console.log('Destruyendo gráfico existente');
				chart.destroy();
			}
			const config = createChartConfig();
			if (config) {
				console.log('Creando nuevo gráfico');
				chart = new Chart(ctx, config);
			}
		}
	}

	onMount(() => {
		console.log('Componente montado');
		return () => {
			if (chart) {
				console.log('Limpiando gráfico');
				chart.destroy();
			}
		};
	});
</script>

<div class="card variant-ghost p-4" style="background-color: rgb(32, 32, 32);">
	<h2 class="h3 font-serif mb-4 text-white">
		{title}
		{#if seasonName}
			<span class="text-sm opacity-75">({seasonName})</span>
		{/if}
	</h2>
	<div class="relative h-[300px] w-full">
		{#if !eloHistory.length}
			<div class="absolute inset-0 flex items-center justify-center">
				<p class="text-center text-white opacity-75">No hay datos de ELO para mostrar</p>
			</div>
		{:else}
			<canvas bind:this={chartCanvas} class="w-full h-full"></canvas>
		{/if}
	</div>
</div>
