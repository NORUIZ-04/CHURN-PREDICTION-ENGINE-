from fastapi import APIRouter, HTTPException
import pandas as pd
import numpy as np

from config import PROCESSED_DATA_DIR
from services.decision_engine import build_decisions

router = APIRouter(
    prefix="/decision",
    tags=["decision"]
)


@router.get("/plan/{filename}")
def decision_plan(
    filename: str,
    budget: float = 5000,
    limit: int = 50
):

    path = PROCESSED_DATA_DIR / filename

    if not path.exists():
        raise HTTPException(404, "file not found")

    df = pd.read_csv(path)

    decisions = build_decisions(df, budget)

    decisions = decisions.head(limit)

    # ✅ JSON safety cleanup
    decisions = decisions.replace(
        [np.inf, -np.inf],
        np.nan
    ).fillna(0)

    return decisions.to_dict(orient="records")





@router.get("/urgent/{filename}")
def urgent_decisions(filename: str, budget: float = 5000):

    path = PROCESSED_DATA_DIR / filename

    if not path.exists():
        raise HTTPException(404, "file not found")

    df = pd.read_csv(path)

    # uses your full stack:
    # predictor + uplift + TTC + value + shap
    decisions = build_decisions(df, budget=budget)

    # only urgent/high rows
    urgent = decisions[
        decisions["urgency"] == "high"
    ]

    return urgent.to_dict("records")
