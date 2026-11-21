# ORBITWATCH — Space Debris Monitoring & Analytics Dashboard

ORBITWATCH is a responsive, space-agency-inspired dashboard for exploring Earth's orbital debris environment. It combines a Python data-processing pipeline with an HTML, CSS and JavaScript frontend. Python reads the source CSV, validates and analyses records with pandas and NumPy, then exports `data/data.json`. Chart.js renders all charts in the browser from that generated JSON.

> **Data integrity note:** The included dataset is a sourced starter dataset, not a complete annual census. Different agencies and surveillance networks use different catalogues and definitions. ORBITWATCH keeps source dates and qualifiers visible and does not combine incompatible totals.

## Features

- Python-to-JSON data pipeline (`python/update_data.py`)
- Responsive dashboard with animated starfield, CSS Earth/orbit illustration and reveal effects
- Dynamic KPI cards populated from JSON
- Interactive Chart.js line, bar and doughnut charts
- Trend range filter
- Sourced category snapshot and modelled debris population comparison
- LEO / MEO / GEO context panels
- Qualitative collision-risk context (no fabricated collision probability)
- Source register and methodology/limitations section
- No database, Flask, Django or Node backend

## Technologies

- Python 3, `os`, `csv`, `pandas`, `numpy`
- HTML5, CSS3 and vanilla JavaScript
- Chart.js 4 (CDN)
- Google Fonts (CDN)

## Folder structure

```text
ORBITWATCH/
├── index.html
├── README.md
├── requirements.txt
├── data/
│   ├── space_debris.csv
│   └── data.json
├── python/
│   ├── update_data.py
│   ├── data_processing.py
│   └── analytics.py
├── css/
│   ├── style.css
│   └── animations.css
├── js/
│   ├── main.js
│   ├── charts.js
│   ├── dashboard.js
│   └── animations.js
└── assets/
    ├── images/
    └── icons/
```

## Requirements

- Python 3.9 or newer
- pip
- Internet connection for the Chart.js CDN and Google Fonts
- A modern browser

## Installation

Open a terminal in the project folder:

```bash
python -m pip install -r requirements.txt
```

## Regenerate dashboard data

The CSV file is the source of truth:

`data/space_debris.csv`

Each row includes a record type, year, snapshot date, metric, value, unit, source name, source URL, qualifier and notes.

1. Make a copy of `data/space_debris.csv` before editing.
2. Change an existing value only when you have a reliable source for the replacement.
3. To add a record, keep the same column structure and provide a source URL, date and qualifier.
4. Run:

```bash
python python/update_data.py
```

5. The script regenerates `data/data.json`.
6. Refresh the website. The browser fetches the JSON without caching.

For a new trend checkpoint, use `record_type=trend` and `metric=tracked_objects`. For a new composition snapshot, use `record_type=composition` and add all categories belonging to the same snapshot date and catalogue definition. Update the composition chart's label/filter logic if you introduce a second composition snapshot. Do not combine different surveillance networks into one trend.

## Run locally

Browsers often block `fetch()` when `index.html` is opened directly using a `file://` URL. Use Python's built-in static file server instead:

```bash
python -m http.server 8000
```

Then open:

`http://localhost:8000`

This is only a static preview server. The project does not use a backend application. You can stop it with `Ctrl+C`.

## GitHub Pages deployment

1. Create a GitHub repository, for example `orbitwatch-space-debris-dashboard`.
2. Upload the complete contents of this folder to the repository root.
3. Commit and push the files.
4. Open **Settings → Pages** in the repository.
5. Under **Build and deployment**, select **Deploy from a branch**.
6. Select the `main` branch and `/ (root)` folder, then save.
7. Wait for GitHub Pages to publish the site.
8. Open the published URL.

GitHub Pages serves the pre-generated `data/data.json`. Python is not executed on GitHub Pages. Whenever you update the CSV, run the Python script locally, then commit both the CSV and regenerated JSON.

## Data sources and definitions

The CSV records source references per measurement. Principal sources used in this starter dataset:

- **ESA Space Environment Report 2024** — reports approximately 35,000 tracked objects in its report edition.
  <https://www.esa.int/da/articles/esa-space-environment-report-2024>
- **ESA Space Environment Report 2025** — reports about 40,000 tracked objects and about 11,000 active payloads.
  <https://www.esa.int/es/articles/esa-space-environment-report-2025>
- **ESA Space Environment Statistics** — page last updated 17 November 2026; reports about 47,330 regularly tracked objects, about 19,770 satellites still in space and about 15,800 functioning satellites.
  <https://sdup.esoc.esa.int/discosweb/statistics/>
- **NASA Orbital Debris Quarterly News, Volume 29, Issue 3 (September 2025)** — satellite box score as of 4 June 2025: 14,655 spacecraft (active and defunct) and 15,182 spent rocket bodies plus other cataloged debris.
  <https://ntrs.nasa.gov/api/citations/20250008945/downloads/ODQN%2029-3_final.pdf>
- **ESA Space Environment Report, reference epoch 1 August 2024** — MASTER model estimates approximately 54,000 objects larger than 10 cm, 1.2 million from 1 cm to 10 cm, and 130 million from 1 mm to 1 cm.
  <https://www.sdo.esoc.esa.int/environment_report/Space_Environment_Report_latest.pdf>
- **NASA Orbital Debris Program Office FAQ** — definitions, tracking thresholds and debris context.
  <https://orbitaldebris.jsc.nasa.gov/faq/>

## Data limitations

- The trend chart uses selected report checkpoints (2023, 2024 and 2026), not a complete annual time series from 2000 onward. Values are approximate report-level figures and should not be interpreted as exact year-end counts.
- The ESA and NASA catalogue values refer to different surveillance systems. They are not interchangeable and are not joined into one trend.
- NASA's June 2025 composition categories group active and defunct spacecraft together and combine spent rocket bodies with other cataloged debris. The dashboard does not pretend those groups are four separately verified categories.
- ESA's modelled populations are estimates for a dated reference epoch. They are not the same as the routinely tracked catalogue.
- LEO, MEO and GEO descriptions are qualitative in this version; no unsupported orbit-specific counts are displayed.
- The congestion panel summarizes ESA's qualitative risk context. It is not a collision probability, conjunction warning or operational safety product.
- Always revisit the original source before replacing a measurement. A source URL and a data cutoff date are retained in the generated JSON.

## GitHub repository description

**A Python-powered space debris monitoring dashboard with sourced orbital statistics, interactive Chart.js analytics, and a transparent CSV-to-JSON data pipeline.**

## License

For educational and demonstration use. Check the terms of each external data source before redistributing source material. ORBITWATCH is an independent educational project and is not affiliated with NASA or ESA.
