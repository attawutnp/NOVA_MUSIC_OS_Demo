import { useEffect, useMemo, useRef } from "react";
import Chart from "chart.js/auto";

function configureChartDefaults() {
  Chart.defaults.font.family = "'Inter', sans-serif";
  Chart.defaults.font.size = 12;
  Chart.defaults.color = "#8a8c91";
  Chart.defaults.plugins.legend.display = false;
  Chart.defaults.elements.line.tension = 0.35;
  Chart.defaults.elements.point.radius = 0;
  Chart.defaults.elements.point.hoverRadius = 5;
}

function ChartCanvas({ config, style, id }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) {
      return undefined;
    }

    configureChartDefaults();
    const chart = new Chart(canvasRef.current, config);
    return () => chart.destroy();
  }, [config]);

  return <canvas ref={canvasRef} id={id} style={style} />;
}

export function DashboardTrendChart() {
  const config = useMemo(() => ({ type: "line", data: { labels: ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"], datasets: [{ label: "Revenue", data: [28400, 31200, 38900, 42100, 44500, 47820], borderColor: "#4575cd", backgroundColor: "rgba(69,117,205,0.1)", fill: true, borderWidth: 2 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { tooltip: { callbacks: { label(context) { return `$${context.parsed.y.toLocaleString()}`; } } } }, scales: { y: { beginAtZero: false, ticks: { callback: (value) => `$${Number(value / 1000).toFixed(0)}k` } }, x: { grid: { display: false } } } } }), []);
  return <ChartCanvas config={config} id="revenueChart" />;
}

export function ApprovalLaneChart() {
  const config = useMemo(() => ({ type: "bar", data: { labels: ["Spotify", "Apple Music", "YouTube", "Amazon", "Tidal", "Others"], datasets: [{ data: [27412, 9564, 4303, 2391, 1435, 2715], backgroundColor: ["#1DB954", "#FC3C44", "#FF0000", "#FF9900", "#000000", "#8a8c91"], borderRadius: 6, barThickness: 32 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { tooltip: { callbacks: { label(context) { return `$${context.parsed.y.toLocaleString()}`; } } } }, scales: { y: { beginAtZero: true, ticks: { callback: (value) => `$${Number(value / 1000).toFixed(0)}k` } }, x: { grid: { display: false } } } } }), []);
  return <ChartCanvas config={config} id="platformBarChart" style={{ height: 180 }} />;
}

export function DistributorMixChart() {
  const config = useMemo(() => ({ type: "doughnut", data: { labels: ["Spotify", "Apple Music", "YouTube", "Amazon", "Tidal", "Others"], datasets: [{ data: [57.3, 20.0, 9.0, 5.0, 3.0, 5.7], backgroundColor: ["#1DB954", "#FC3C44", "#FF0000", "#FF9900", "#000000", "#8a8c91"], borderWidth: 0, spacing: 2 }] }, options: { responsive: true, maintainAspectRatio: true, cutout: "65%", plugins: { legend: { display: true, position: "bottom", labels: { padding: 12, usePointStyle: true, pointStyle: "circle" } }, tooltip: { callbacks: { label(context) { return `${context.label}: ${context.parsed}%`; } } } } } }), []);
  return <ChartCanvas config={config} id="platformDoughnut" />;
}

export function ReleaseTrendChart() {
  const config = useMemo(() => ({ type: "line", data: { labels: ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"], datasets: [{ label: "Spotify", data: [16200, 17800, 22100, 24000, 25400, 27412], borderColor: "#1DB954", borderWidth: 2 }, { label: "Apple Music", data: [5700, 6200, 7800, 8400, 8900, 9564], borderColor: "#FC3C44", borderWidth: 2 }, { label: "YouTube", data: [2500, 2800, 3500, 3800, 4000, 4303], borderColor: "#FF0000", borderWidth: 2 }, { label: "Amazon", data: [1400, 1500, 1900, 2100, 2200, 2391], borderColor: "#FF9900", borderWidth: 2 }, { label: "Others", data: [2600, 2900, 3600, 3800, 4000, 4150], borderColor: "#8a8c91", borderWidth: 1.5, borderDash: [4, 4] }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true, position: "bottom", labels: { padding: 14, usePointStyle: true, pointStyle: "circle", font: { size: 11 } } } }, interaction: { mode: "index", intersect: false }, scales: { y: { beginAtZero: false, ticks: { callback: (value) => `$${Number(value / 1000).toFixed(0)}k` } }, x: { grid: { display: false } } } } }), []);
  return <ChartCanvas config={config} id="revenueTrendChart" />;
}
