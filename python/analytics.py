"""Small analytics helpers used by the ORBITWATCH data pipeline."""

import numpy as np
import pandas as pd


def calculate_growth(values):
    """Return first-to-last percentage growth; None when not meaningful."""
    clean = pd.Series(values, dtype="float64").dropna()
    if len(clean) < 2 or clean.iloc[0] == 0:
        return None
    return round(float((clean.iloc[-1] - clean.iloc[0]) / clean.iloc[0] * 100), 1)


def trend_summary(trend_frame):
    """Prepare sorted trend points and a transparent growth summary."""
    frame = trend_frame.sort_values("year").copy()
    values = frame["value"].astype(float).to_numpy()
    points = []
    for row in frame.itertuples():
        points.append({
            "year": int(row.year),
            "value": int(row.value),
            "qualifier": str(row.qualifier),
            "source": str(row.source_name),
            "source_url": str(row.source_url),
            "snapshot_date": str(row.snapshot_date),
            "notes": str(row.notes),
        })
    growth = calculate_growth(values)
    return {
        "points": points,
        "growth_percent": growth,
        "growth_label": "change between reported ESA checkpoints",
        "method_note": (
            "Checkpoints come from different ESA report editions and are rounded "
            "or approximate. They are not a uniform year-end time series."
        ),
    }


def category_summary(composition_frame):
    """Build categories from one explicitly dated NASA snapshot."""
    categories = []
    for row in composition_frame.itertuples():
        categories.append({
            "key": str(row.metric),
            "label": str(row.metric).replace("_", " ").title(),
            "value": int(row.value),
            "source": str(row.source_name),
            "source_url": str(row.source_url),
            "qualifier": str(row.qualifier),
            "snapshot_date": str(row.snapshot_date),
            "notes": str(row.notes),
        })
    total = int(np.sum([item["value"] for item in categories]))
    for item in categories:
        item["share_percent"] = round(item["value"] / total * 100, 1) if total else 0
    return {"snapshot_date": "2025-06-04", "total": total, "categories": categories,
            "note": "NASA catalog snapshot. Spacecraft includes active and defunct spacecraft; the other category combines spent rocket bodies and other cataloged debris."}
