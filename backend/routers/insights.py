from fastapi import APIRouter, HTTPException
import pandas as pd
import traceback
import json
import os

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
            raise HTTPException(404, f"Dataset not found: {dataset}")

        # cache key
        fid = file_hash(path)

        cached = load_insights_cache(fid)
        if cached:
            return cached

        # load dataset
        df = pd.read_csv(path)

        insights = generate_executive_insights(df)

        save_insights_cache(fid, insights)

        return insights

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    


RESULTS_FILE = "data/scoring_results.json"


@router.get("/insights/latest")
def get_latest_insights():
    if not os.path.exists(RESULTS_FILE):
        return {"message": "No insights available yet"}

    with open(RESULTS_FILE, "r") as f:
        results = json.load(f)

    if not results:
        return {"message": "No insights available"}

    return results[-1]   # latest run