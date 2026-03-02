from fastapi import APIRouter, UploadFile, File, HTTPException
import pandas as pd

from config import RAW_DATA_DIR, PROCESSED_DATA_DIR

from services.synthetic_generator import generate_synthetic_customers
from services.preprocessing import clean_telco
from services.feature_engineering import (
    basic_features,
    advanced_features
)
from services.profiling import profile_dataframe

router = APIRouter(
    prefix="/data",
    tags=["data"]
)

# =====================================================
# Generate Synthetic Dataset
# =====================================================

@router.post("/generate")
def generate_dataset(n: int = 5000):

    try:
        df = generate_synthetic_customers(n)

        filename = f"synthetic_{n}.csv"
        path = RAW_DATA_DIR / filename

        df.to_csv(path, index=False)

        return {
            "message": "synthetic dataset generated",
            "rows": len(df),
            "file": filename
        }

    except Exception as e:
        raise HTTPException(500, str(e))


# =====================================================
# Upload CSV (optional — hybrid support)
# =====================================================

@router.post("/upload")
async def upload_dataset(file: UploadFile = File(...)):

    if not file.filename.endswith(".csv"):
        raise HTTPException(400, "Only CSV allowed")

    path = RAW_DATA_DIR / file.filename

    try:
        with open(path, "wb") as f:
            f.write(await file.read())

        df = pd.read_csv(path)

        return {
            "message": "uploaded",
            "rows": len(df),
            "columns": list(df.columns),
            "saved_as": file.filename
        }

    except Exception as e:
        raise HTTPException(500, str(e))


# =====================================================
# Profile Dataset
# =====================================================

@router.get("/profile/{filename}")
def dataset_profile(filename: str):

    path = RAW_DATA_DIR / filename

    if not path.exists():
        raise HTTPException(404, "File not found")

    try:
        df = pd.read_csv(path)
        return profile_dataframe(df)

    except Exception as e:
        raise HTTPException(500, str(e))


# =====================================================
# Process Dataset (CRITICAL — MODEL FEATURES BUILT HERE)
# =====================================================

@router.post("/process/{filename}")
def process_dataset(filename: str):

    path = RAW_DATA_DIR / filename

    if not path.exists():
        raise HTTPException(404, "Raw file not found")

    try:
        df = pd.read_csv(path)

        # ---------- CLEAN ----------
        df = clean_telco(df)

        # ---------- FEATURES ----------
        df = basic_features(df)
        df = advanced_features(df)

        # ---------- SAVE ----------
        out_name = f"processed_{filename}"
        out_path = PROCESSED_DATA_DIR / out_name

        df.to_csv(out_path, index=False)

        return {
            "status": "processed",
            "output_file": out_name,
            "rows": len(df),
            "columns": list(df.columns)
        }

    except Exception as e:
        raise HTTPException(500, str(e))


# =====================================================
# Preview Processed Dataset
# =====================================================

@router.get("/preview/{filename}")
def preview_processed(filename: str):

    path = PROCESSED_DATA_DIR / filename

    if not path.exists():
        raise HTTPException(404, "Processed file not found")

    try:
        df = pd.read_csv(path)
        return df.head(20).to_dict(orient="records")

    except Exception as e:
        raise HTTPException(500, str(e))
