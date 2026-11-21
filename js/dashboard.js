/* Loads the Python-generated JSON and populates dashboard content. */
window.Orbitwatch = window.Orbitwatch || {};

window.Orbitwatch.loadDashboardData = async function () {
    const response = await fetch("data/data.json", { cache: "no-store" });
    if (!response.ok) {
        throw new Error(`Could not load data/data.json (${response.status}).`);
    }
    const data = await response.json();
    window.Orbitwatch.data = data;
    return data;
};

window.Orbitwatch.formatNumber = function (value) {
    return new Intl.NumberFormat("en-US").format(value);
};

window.Orbitwatch.renderOverview = function (data) {
    const stats = data.overview;
    const statMap = {
        tracked_objects: stats.tracked_objects,
        functioning_satellites: stats.functioning_satellites,
        satellites_still_in_space: stats.satellites_still_in_space,
        fragmentation_events: stats.fragmentation_events
    };

    Object.entries(statMap).forEach(([key, record]) => {
        const element = document.querySelector(`[data-stat="${key}"]`);
        if (!element || !record) return;
        const prefix = key === "fragmentation_events" ? ">" : "";
        element.textContent = prefix + window.Orbitwatch.formatNumber(record.value);
    });

    document.getElementById("trackedDate").textContent = stats.tracked_objects.snapshot_date;
    document.getElementById("functioningDate").textContent = stats.functioning_satellites.snapshot_date;
    document.getElementById("generatedDate").textContent = new Date(data.meta.generated_at).toLocaleString();
    document.getElementById("footerYear").textContent = new Date().getFullYear();
    document.getElementById("riskStatus").textContent = data.risk_context.status;
    document.getElementById("riskSummary").textContent = data.risk_context.summary;

    const limitations = document.getElementById("limitationsList");
    limitations.innerHTML = "";
    data.methodology.limitations.forEach((note) => {
        const item = document.createElement("li");
        item.textContent = note;
        limitations.appendChild(item);
    });

    const sourceContainer = document.getElementById("sourceLinks");
    sourceContainer.innerHTML = "";
    data.sources.forEach((source) => {
        const link = document.createElement("a");
        link.className = "source-link";
        link.href = source.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        const name = document.createElement("strong");
        name.textContent = source.name;
        const arrow = document.createElement("span");
        arrow.textContent = "↗";
        link.append(name, arrow);
        sourceContainer.appendChild(link);
    });
};
