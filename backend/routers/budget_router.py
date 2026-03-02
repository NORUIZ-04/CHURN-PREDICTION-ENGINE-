from fastapi import APIRouter, HTTPException
import pandas as pd

from config import PROCESSED_DATA_DIR
from services.uplift_model import predict_uplift
from services.budget_optimizer import optimize_budget

router = APIRouter(
    prefix="/budget",
    tags=["budget"]
)


@router.get("/optimize/{filename}")
def budget_optimize(
    filename: str,
    budget: float = 5000,
    limit: int = 100
):

    path = PROCESSED_DATA_DIR / filename

    if not path.exists():
        raise HTTPException(404, "file not found")

    df = pd.read_csv(path)

    # run uplift first
    df = predict_uplift(df)

    # optimize
    selected, spent = optimize_budget(df, budget)

    selected = selected.head(limit)

    return {
        "budget": budget,
        "spent": float(spent),
        "selected_count": len(selected),
        "customers": selected.to_dict(orient="records")
    }
