// src/lib/config/chart.ts
import {
	Chart,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
	Filler
} from 'chart.js';

// Registrar los componentes que necesitamos
Chart.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
	Filler // Para poder usar fill: true en los gráficos
);

// Configuración global por defecto
Chart.defaults.color = '#fff';
Chart.defaults.font.family = 'system-ui, sans-serif';
Chart.defaults.responsive = true;
Chart.defaults.maintainAspectRatio = false;

// Exportar por si necesitamos acceder a Chart en algún otro lugar
export { Chart };
