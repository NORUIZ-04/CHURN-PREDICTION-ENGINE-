import os
import json
from datetime import datetime
import pandas as pd
from ingestion.utils.logger import get_logger

logger = get_logger()

DATASET_DIR = "data/processed"
METADATA_FILE = "data/dataset_registry.json"


def ensure_directories():
    os.makedirs(DATASET_DIR, exist_ok=True)
    os.makedirs("data", exist_ok=True)


def load_registry():
    if not os.path.exists(METADATA_FILE):
        return []

    with open(METADATA_FILE, "r") as f:
        return json.load(f)


def save_registry(registry):
    with open(METADATA_FILE, "w") as f:
        json.dump(registry, f, indent=2)


def store_dataset(df: pd.DataFrame, source="manual_upload") -> str:
    """
    Store processed dataset with versioning.
    """

    ensure_directories()

    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    filename = f"dataset_{timestamp}.parquet"
    path = os.path.join(DATASET_DIR, filename)

    df.to_parquet(path, index=False)

    registry = load_registry()

    entry = {
        "dataset_name": filename,
        "path": path,
        "rows": len(df),
        "columns": list(df.columns),
        "source": source,
        "created_at": timestamp
    }

    registry.append(entry)
    save_registry(registry)

    logger.info(f"Dataset stored: {path}")

    return path