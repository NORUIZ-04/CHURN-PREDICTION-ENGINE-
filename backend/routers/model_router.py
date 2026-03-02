from fastapi import APIRouter, HTTPException
import pandas as pd
from pathlib import Path

from config import PROCESSED_DATA_DIR
from services.modeling import train_churn_model, predict_dataframe

router = APIRouter(prefix="/model", tags=["model"])


# -------------------
# Train model
# -------------------

@router.post("/train/{filename}")
def train_model(filename: str):

    path = PROCESSED_DATA_DIR / filename

    if not path.exists():
        raise HTTPException(404, "Processed file not found")

    df = pd.read_csv(path)

    metrics = train_churn_model(df)

    return {
        "message": "model trained",
        "metrics": metrics
    }


# -------------------
# Predict on dataset
# -------------------

@router.get("/predict/{filename}")
def predict_file(filename: str):

    path = PROCESSED_DATA_DIR / filename

    df = pd.read_csv(path)

    probs = predict_dataframe(df)

    df["churn_probability"] = probs

    return df.head(50).to_dict()
