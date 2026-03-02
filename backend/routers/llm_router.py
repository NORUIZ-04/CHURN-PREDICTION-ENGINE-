from fastapi import APIRouter, HTTPException
import pandas as pd

from config import PROCESSED_DATA_DIR
from services.decision_engine import build_decisions
from services.llm_explainer import explain_decisions_llm

router = APIRouter(
    prefix="/llm",
    tags=["llm"]
)


@router.get("/decision_explain/{filename}")
def llm_decision_explain(
    filename: str,
    budget: float = 5000,
    limit: int = 5
):

    path = PROCESSED_DATA_DIR / filename

    if not path.exists():
        raise HTTPException(404, "file not found")

    df = pd.read_csv(path)

    decisions = build_decisions(df, budget)

    records = decisions.to_dict(orient="records")

    explained = explain_decisions_llm(records, limit)

    return explained
