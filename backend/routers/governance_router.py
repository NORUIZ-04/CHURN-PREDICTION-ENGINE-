from fastapi import APIRouter, HTTPException
import pandas as pd

from config import PROCESSED_DATA_DIR
from services.decision_engine import build_decisions
from services.governance import run_fairness_audit

router = APIRouter(
    prefix="/governance",
    tags=["governance"]
)


@router.get("/fairness/{filename}")
def fairness_audit(
    filename: str,
    budget: float = 5000
):

    path = PROCESSED_DATA_DIR / filename

    if not path.exists():
        raise HTTPException(404, "file not found")

    raw_df = pd.read_csv(path)

    decisions = build_decisions(raw_df, budget)

    report = run_fairness_audit(
        decisions,
        raw_df
    )

    return report
