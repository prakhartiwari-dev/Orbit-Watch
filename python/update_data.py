"""Regenerate data/data.json from data/space_debris.csv.

Run from the project root:
    python python/update_data.py
"""

import os
import sys

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PYTHON_DIR = os.path.dirname(os.path.abspath(__file__))
if PYTHON_DIR not in sys.path:
    sys.path.insert(0, PYTHON_DIR)

from data_processing import build_payload, write_json


def main():
    payload = build_payload(PROJECT_ROOT)
    output_path = write_json(PROJECT_ROOT, payload)
    print("ORBITWATCH data pipeline completed.")
    print(f"JSON written to: {output_path}")
    print(f"Trend checkpoints: {len(payload['trend']['points'])}")
    print(f"NASA composition categories: {len(payload['composition']['categories'])}")
    print(f"Tracked objects (latest ESA snapshot): {payload['overview']['tracked_objects']['value']:,}")


if __name__ == "__main__":
    main()
