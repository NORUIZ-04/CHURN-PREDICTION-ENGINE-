from fastapi import APIRouter, HTTPException
import pandas as pd

from config import PROCESSED_DATA_DIR
from services.predictor import predict_dataframe

router = APIRouter(
    prefix="/predict",
    tags=["predict"]
)


# -----------------------
# Batch file prediction
# -----------------------

@router.get("/file/{filename}")
def predict_file(filename: str):

    path = PROCESSED_DATA_DIR / filename

    if not path.exists():
        raise HTTPException(404, "File not found")

    df = pd.read_csv(path)

    scored = predict_dataframe(df)

    return scored.to_dict(orient="records")

# -----------------------
# Single customer JSON
# -----------------------

@router.post("/single")
def predict_single(customer: dict):

    df = pd.DataFrame([customer])

    out = predict_dataframe(df)

    return out.to_dict(orient="records")[0]
