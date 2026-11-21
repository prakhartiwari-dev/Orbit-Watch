"""Read the source CSV and assemble a browser-ready data model."""

import os
import json
import csv
import pandas as pd
import numpy as np

try:
    from .analytics import trend_summary, category_summary
except ImportError:
    from analytics import trend_summary, category_summary


def load_dataset(project_root):
    csv_path = os.path.join(project_root, "data", "space_debris.csv")
    # csv module is used for a lightweight validation pass before pandas loads it.
    with open(csv_path, "r", encoding="utf-8", newline="") as handle:
        reader = csv.DictReader(handle)
        required = {"record_type", "year", "metric", "value", "source_url"}
        if not required.issubset(set(reader.fieldnames or [])):
            raise ValueError("The source CSV is missing required columns.")
        rows = list(reader)
    if not rows:
        raise ValueError("The source CSV contains no data rows.")

    frame = pd.DataFrame(rows)
    frame["year"] = pd.to_numeric(frame["year"], errors="raise").astype(int)
    frame["value"] = pd.to_numeric(frame["value"], errors="raise")
    frame["record_type"] = frame["record_type"].astype(str)
    frame["metric"] = frame["metric"].astype(str)
    return frame


def build_payload(project_root):
    frame = load_dataset(project_root)
    trend = trend_summary(frame[frame["record_type"] == "trend"])
    composition = category_summary(frame[frame["record_type"] == "composition"])

    def latest_metric(metric_name):
        rows = frame[frame["metric"] == metric_name]
        if rows.empty:
            return None
        row = rows.iloc[-1]
        return {
            "value": int(row["value"]),
            "qualifier": str(row["qualifier"]),
            "snapshot_date": str(row["snapshot_date"]),
            "source": str(row["source_name"]),
            "source_url": str(row["source_url"]),
            "notes": str(row["notes"]),
        }

    modelled = {}
    for metric in ["objects_1cm_to_10cm", "objects_over_10cm", "objects_1mm_to_1cm"]:
        modelled[metric] = latest_metric(metric)

    sources = []
    for row in frame[["source_name", "source_url"]].drop_duplicates().itertuples(index=False):
        sources.append({"name": row.source_name, "url": row.source_url})

    current_tracked = latest_metric("tracked_objects")
    functioning = latest_metric("functioning_satellites")
    satellites_in_space = latest_metric("satellites_still_in_space")
    fragmentation = latest_metric("fragmentation_events")

    return {
        "meta": {
            "project": "ORBITWATCH",
            "generated_at": pd.Timestamp.now(tz="UTC").isoformat(),
            "data_cutoff": "2026-11-17",
            "data_policy": "Published measurements are separated by source, date, definition, and qualifier.",
            "version": 1,
        },
        "overview": {
            "tracked_objects": current_tracked,
            "functioning_satellites": functioning,
            "satellites_still_in_space": satellites_in_space,
            "fragmentation_events": fragmentation,
            "reported_checkpoint_growth_percent": trend["growth_percent"],
        },
        "trend": trend,
        "composition": composition,
        "modelled_population": modelled,
        "orbital_regions": [
            {"code": "LEO", "name": "Low Earth Orbit", "altitude": "Below 2,000 km", "context": "Most catalogued debris and many operational satellites occupy this broad region.", "quantified": False},
            {"code": "MEO", "name": "Medium Earth Orbit", "altitude": "2,000–35,786 km", "context": "Hosts important navigation satellite constellations.", "quantified": False},
            {"code": "GEO", "name": "Geostationary Earth Orbit", "altitude": "About 35,786 km", "context": "A valuable orbital region used by communications and weather satellites.", "quantified": False},
        ],
        "risk_context": {
            "status": "Elevated congestion context",
            "is_numeric_risk_score": False,
            "summary": "ESA identifies significant conjunction risk in heavily used altitude bands, particularly around 400–600 km. This dashboard does not calculate collision probabilities.",
            "source_name": "ESA Space Environment Report 2026",
            "source_url": "https://www.sdo.esoc.esa.int/publications/Space_Environment_Report_I10R0_20260501.pdf",
        },
        "methodology": {
            "historical_note": trend["method_note"],
            "composition_note": composition["note"],
            "limitations": [
                "The historical line contains selected reported checkpoints, not a complete annual series from 2000 onward.",
                "ESA network tracking totals and NASA US Space Surveillance Network catalog totals use different systems and must not be directly compared as a continuous series.",
                "The NASA composition snapshot groups active and defunct spacecraft together and combines spent rocket bodies with other cataloged debris.",
                "Modelled populations include objects too small to be routinely tracked; they are estimates, not catalogued object counts.",
                "LEO, MEO, and GEO are described qualitatively because a compatible, dated orbit-by-orbit count is not included in this starter dataset.",
            ],
        },
        "sources": sources,
    }


def write_json(project_root, payload):
    output_path = os.path.join(project_root, "data", "data.json")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as handle:
        json.dump(payload, handle, indent=2, ensure_ascii=False)
        handle.write("\n")
    return output_path
