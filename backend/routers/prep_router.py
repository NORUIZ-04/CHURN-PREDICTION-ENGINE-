from fastapi import APIRouter, HTTPException
import pandas as pd

from config import PROCESSED_DATA_DIR
from services.shared_preprocessor import build_preprocessor

router = APIRouter(
    prefix="/prep",
    tags=["preprocessing"]
)


@router.post("/train/{filename}")
def train_prep(filename: str):

    path = PROCESSED_DATA_DIR / filename

    if not path.exists():
        raise HTTPException(404, "file not found")

    df = pd.read_csv(path)

    build_preprocessor(df)

    return {
        "message": "shared preprocessor trained"
    }
