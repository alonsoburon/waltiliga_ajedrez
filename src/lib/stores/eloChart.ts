// stores/eloChart.ts
import { derived } from 'svelte/store';
import type { ChartData, ChartOptions } from 'chart.js';
import { elo } from './elo';
import { seasons } from './seasons';

export interface EloChartConfig {
	data: ChartData<'line'>;
	options: ChartOptions<'line'>;
}

export const createChartConfig = (
	eloHistory: { date: Date; elo: number; change: number }[]
): EloChartConfig => {
	const minElo = Math.min(...eloHistory.map((h) => h.elo));
	const maxElo = Math.max(...eloHistory.map((h) => h.elo));

	return {
		data: {
			labels: eloHistory.map((h) => h.date.toLocaleDateString('es-ES')),
			datasets: [
				{
					label: 'ELO',
					data: eloHistory.map((h) => h.elo),
					fill: true,
					backgroundColor: 'rgba(75, 192, 192, 0.2)',
					borderColor: 'rgb(75, 192, 192)',
					borderWidth: 2,
					tension: 0.4,
					pointRadius: 4,
					pointHoverRadius: 6,
					pointBackgroundColor: 'rgb(75, 192, 192)',
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
					titleColor: 'rgb(75, 192, 192)',
					callbacks: {
						title: (tooltipItems) => {
							const date = eloHistory[tooltipItems[0].dataIndex].date;
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
					grid: { display: false },
					ticks: {
						maxRotation: 45,
						minRotation: 45
					}
				},
				y: {
					min: Math.floor((minElo - 50) / 50) * 50,
					max: Math.ceil((maxElo + 50) / 50) * 50,
					ticks: { stepSize: 50 },
					grid: { color: 'rgba(255, 255, 255, 0.1)' }
				}
			}
		}
	};
};

export function getPlayerChartConfig(playerId: number, seasonId: number | 'all' = 'all') {
	const eloHistory = elo.getEloHistory(playerId);
	const seasonDates = seasons.getSeasonDates(seasonId);

	return derived([eloHistory, seasonDates], ([$eloHistory, $seasonDates]) => {
		if (!$eloHistory?.length) {
			return createChartConfig([]);
		}

		const filteredHistory =
			seasonId === 'all'
				? $eloHistory
				: $eloHistory.filter((h) => {
						if (!$seasonDates) return false;
						return h.date >= $seasonDates.startDate && h.date <= $seasonDates.endDate;
					});

		return createChartConfig(filteredHistory);
	});
}
