from fastapi import APIRouter
import json
import os

router = APIRouter()

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