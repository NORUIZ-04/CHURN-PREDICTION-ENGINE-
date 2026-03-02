from fastapi import APIRouter, HTTPException
import pandas as pd
import traceback
from services.full_scoring import run_full_scoring

from config import PROCESSED_DATA_DIR
from services.decision_engine import build_decisions
from services.ttc_cache import (
    file_hash,
    load_ttc_cache,
    save_ttc_cache
)

router = APIRouter(
    prefix="/timetochurn",
    tags=["time-to-churn"]
)

@router.get("/summary/{filename}")
def timetochurn_summary(filename: str):

    try:
        path = PROCESSED_DATA_DIR / filename

        if not path.exists():
            raise HTTPException(404, "file not found")

        # ===== CACHE CHECK =====

        fid = file_hash(path)
        cached = load_ttc_cache(fid)

        if cached:
            return cached

        # ===== RUN FULL PIPELINE =====

        df = pd.read_csv(path)

        scored = run_full_scoring(df)

        required = ["risk", "uplift", "time_to_churn"]
        missing = [c for c in required if c not in scored.columns]

        if missing:
            raise HTTPException(400, f"Missing scored columns: {missing}")

        # ===== URGENCY ENGINE =====

        scored["urgency_score"] = (
            scored["risk"] * 0.5 +
            scored["uplift"] * 0.3 +
            (1 / (scored["time_to_churn"] + 1)) * 0.2
        )

        top = scored.sort_values(
            "urgency_score",
            ascending=False
        ).head(20)

        result = {
            "status": "ok",
            "avg_time_to_churn": float(scored.time_to_churn.mean()),
            "min_time_to_churn": float(scored.time_to_churn.min()),
            "urgent_customers": top.to_dict("records")
        }

        # ===== SAVE CACHE =====

        save_ttc_cache(fid, result)

        return result

    except Exception as e:
        traceback.print_exc()
        return {"status": "error", "message": str(e)}
