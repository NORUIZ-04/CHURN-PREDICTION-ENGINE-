import pandas as pd
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
UPLOAD_DIR = BASE_DIR / "uploads"

def load_dataset(filename: str):
    path = UPLOAD_DIR / filename
    if not path.exists():
        raise FileNotFoundError(f"Dataset not found: {path}")
    return pd.read_csv(path)

def load_predictions(filename: str):
    base = Path(filename).stem

    def safe_load(name):
        path = UPLOAD_DIR / name
        if path.exists():
            return pd.read_csv(path)
        print(f"⚠ Missing file: {name}")
        return None

    churn = safe_load(f"churn_output_{base}.csv")
    ttc = safe_load(f"ttc_output_{base}.csv")
    uplift = safe_load(f"uplift_output_{base}.csv")
    decisions = safe_load(f"decisions_output_{base}.csv")

    return churn, ttc, uplift, decisions