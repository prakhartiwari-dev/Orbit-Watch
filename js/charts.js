/* All charts are generated from the JSON produced by Python. */
window.Orbitwatch = window.Orbitwatch || {};

window.Orbitwatch.chartInstances = {};

window.Orbitwatch.chartDefaults = function () {
    Chart.defaults.color = "#91a3b8";
    Chart.defaults.font.family = '"Manrope", sans-serif';
    Chart.defaults.font.size = 10;
    Chart.defaults.plugins.legend.labels.usePointStyle = true;
    Chart.defaults.plugins.legend.labels.boxWidth = 7;
    Chart.defaults.plugins.tooltip.backgroundColor = "#101e31";
    Chart.defaults.plugins.tooltip.borderColor = "rgba(148,174,205,.25)";
    Chart.defaults.plugins.tooltip.borderWidth = 1;
    Chart.defaults.plugins.tooltip.padding = 12;
    Chart.defaults.plugins.tooltip.titleColor = "#f1f5fb";
    Chart.defaults.plugins.tooltip.bodyColor = "#b7c6d7";
    Chart.defaults.animation.duration = 1100;
};

window.Orbitwatch.destroyCharts = function () {
    Object.values(window.Orbitwatch.chartInstances).forEach((chart) => chart.destroy());
    window.Orbitwatch.chartInstances = {};
};

window.Orbitwatch.makeCharts = function (data) {
    if (typeof Chart === "undefined") {
        throw new Error("Chart.js did not load. Check your internet connection.");
    }
    window.Orbitwatch.chartDefaults();
    window.Orbitwatch.destroyCharts();

    const trendPoints = data.trend.points;
    const labels = trendPoints.map((point) => String(point.year));
    const values = trendPoints.map((point) => point.value);
    const trendCtx = document.getElementById("trendChart");
    window.Orbitwatch.chartInstances.trend = new Chart(trendCtx, {
        type: "line",
        data: {
            labels,
            datasets: [{
                label: "Tracked objects (reported checkpoint)",
                data: values,
                borderColor: "#e9bb63",
                backgroundColor: (context) => {
                    const chart = context.chart;
                    const { ctx, chartArea } = chart;
                    if (!chartArea) return "rgba(233,187,99,.15)";
                    const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                    gradient.addColorStop(0, "rgba(233,187,99,.28)");
                    gradient.addColorStop(1, "rgba(233,187,99,0)");
                    return gradient;
                },
                fill: true,
                tension: .34,
                borderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 8,
                pointBackgroundColor: "#ffd98c",
                pointBorderColor: "#101a29",
                pointBorderWidth: 2
            }]
        },
        options: {
            maintainAspectRatio: false,
            interaction: { intersect: false, mode: "index" },
            plugins: {
                legend: { display: true, position: "bottom" },
                tooltip: { callbacks: { afterBody: (items) => {
                    const point = trendPoints[items[0].dataIndex];
                    return [`${point.qualifier.toUpperCase()} · ${point.snapshot_date}`, point.source, point.notes];
                }}}
            },
            scales: {
                x: { grid: { display: false }, title: { display: true, text: "Reported year / edition" } },
                y: { beginAtZero: false, grid: { color: "rgba(148,174,205,.09)" }, ticks: { callback: (value) => Number(value).toLocaleString() }, title: { display: true, text: "Objects" } }
            }
        }
    });

    const composition = data.composition.categories;
    window.Orbitwatch.chartInstances.composition = new Chart(document.getElementById("compositionChart"), {
        type: "doughnut",
        data: {
            labels: composition.map((item) => item.label),
            datasets: [{
                data: composition.map((item) => item.value),
                backgroundColor: ["#e9bb63", "#5d9fca"],
                borderColor: "#0d1828",
                borderWidth: 5,
                hoverOffset: 9
            }]
        },
        options: {
            maintainAspectRatio: false,
            cutout: "68%",
            plugins: {
                legend: { position: "bottom" },
                tooltip: { callbacks: { label: (context) => {
                    const item = composition[context.dataIndex];
                    return `${item.label}: ${item.value.toLocaleString()} (${item.share_percent}%)`;
                }, afterLabel: (context) => composition[context.dataIndex].notes }}
            }
        }
    });
    document.getElementById("compositionNote").textContent = data.composition.note;

    const model = data.modelled_population;
    const populationLabels = [
        "Objects > 10 cm",
        "Objects 1–10 cm",
        "Objects 1 mm–1 cm"
    ];
    const populationValues = [
        model.objects_over_10cm.value,
        model.objects_1cm_to_10cm.value,
        model.objects_1mm_to_1cm.value
    ];
    window.Orbitwatch.chartInstances.population = new Chart(document.getElementById("populationChart"), {
        type: "bar",
        data: {
            labels: populationLabels,
            datasets: [{
                label: "Estimated population",
                data: populationValues,
                backgroundColor: ["#e9bb63", "#72b9e8", "#76d8df"],
                borderRadius: 3,
                maxBarThickness: 40
            }]
        },
        options: {
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { callbacks: { label: (context) => `${context.raw.toLocaleString()} estimated objects` } }
            },
            scales: {
                x: { grid: { display: false } },
                y: { type: "logarithmic", grid: { color: "rgba(148,174,205,.09)" }, ticks: { callback: (value) => Number(value).toLocaleString() }, title: { display: true, text: "Estimated objects · log scale" } }
            }
        }
    });

    window.Orbitwatch.chartInstances.checkpoint = new Chart(document.getElementById("checkpointChart"), {
        type: "bar",
        data: {
            labels,
            datasets: [{
                label: "Reported tracked objects",
                data: values,
                backgroundColor: "rgba(114,185,232,.68)",
                borderColor: "#72b9e8",
                borderWidth: 1,
                borderRadius: 3,
                maxBarThickness: 70
            }]
        },
        options: {
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { callbacks: { afterLabel: (context) => `${trendPoints[context.dataIndex].qualifier} · ${trendPoints[context.dataIndex].source}` } }
            },
            scales: {
                x: { grid: { display: false } },
                y: { beginAtZero: true, grid: { color: "rgba(148,174,205,.09)" }, ticks: { callback: (value) => Number(value).toLocaleString() } }
            }
        }
    });

    document.getElementById("trendNote").textContent = data.trend.method_note;
};

window.Orbitwatch.applyTrendFilter = function (range) {
    const chart = window.Orbitwatch.chartInstances.trend;
    const barChart = window.Orbitwatch.chartInstances.checkpoint;
    if (!chart || !barChart) return;
    const points = window.Orbitwatch.data.trend.points;
    const start = range === "recent" ? Math.max(0, points.length - 2) : 0;
    const labels = points.slice(start).map((point) => String(point.year));
    const values = points.slice(start).map((point) => point.value);
    chart.data.labels = labels;
    chart.data.datasets[0].data = values;
    chart.update();
    barChart.data.labels = labels;
    barChart.data.datasets[0].data = values;
    barChart.update();
};
