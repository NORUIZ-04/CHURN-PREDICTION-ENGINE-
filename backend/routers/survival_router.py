from fastapi import APIRouter, HTTPException
import pandas as pd

from config import PROCESSED_DATA_DIR
from services.survival_model import (
    train_survival_model,
    predict_time_risk
)

router = APIRouter(
    prefix="/survival",
    tags=["survival"]
)


# -------------------------
# Train survival model
# -------------------------

@router.post("/train/{filename}")
def train_survival(filename: str):

    path = PROCESSED_DATA_DIR / filename

    if not path.exists():
        raise HTTPException(404, "File not found")

    df = pd.read_csv(path)

    info = train_survival_model(df)

    return {
        "message": "survival model trained",
        "info": info
    }


# -------------------------
# Predict time to churn
# -------------------------

@router.get("/predict/{filename}")
def survival_predict(filename: str, limit: int = 50):

    path = PROCESSED_DATA_DIR / filename

    if not path.exists():
        raise HTTPException(404, "File not found")

    df = pd.read_csv(path)

    out = predict_time_risk(df)

    out = out.sort_values(
        "predicted_time_to_churn"
    ).head(limit)

    return out.to_dict(orient="records")
