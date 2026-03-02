from fastapi import APIRouter, HTTPException
import pandas as pd
import traceback

from pathlib import Path
from config import PROCESSED_DATA_DIR
from services.insights_cache import (
    file_hash,
    load_insights_cache,
    save_insights_cache
)

from insights.executive_engine import generate_executive_insights

router = APIRouter(
    prefix="/insights",
    tags=["insights"]
)


@router.get("/executive")
def get_executive_insights(dataset: str):
    try:
        path = PROCESSED_DATA_DIR / dataset

        if not path.exists():
            raise HTTPException(404, "dataset not found")

        # ✅ CREATE CACHE KEY
        fid = file_hash(path)

        # ✅ RETURN CACHE IF AVAILABLE
        cached = load_insights_cache(fid)
        if cached:
            return cached

        # ✅ RUN INTELLIGENCE ENGINE
        df = pd.read_csv(path)
        insights = generate_executive_insights(df)

        # ✅ SAVE CACHE
        save_insights_cache(fid, insights)

        return insights

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))