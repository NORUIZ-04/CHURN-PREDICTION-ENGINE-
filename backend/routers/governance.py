# backend/routers/governance.py

from fastapi import APIRouter, HTTPException
import pandas as pd


from services.governance import GovernanceService
from utils.governance_logger import GovernanceLogger
from schemas.governance_schemas import GovernanceRequest


router = APIRouter(prefix="/api/governance", tags=["governance"])

service = GovernanceService()
logger = GovernanceLogger()

from config import PROCESSED_DATA_DIR

DATA_DIR = PROCESSED_DATA_DIR   


# --------------------------------------------------
# POST ANALYZE
# --------------------------------------------------

@router.post("/analyze")
def analyze(req: GovernanceRequest):

    try:
        path = DATA_DIR / f"{req.dataset_id}.csv"

        if not path.exists():
            raise HTTPException(404, "Dataset not found")

        df = pd.read_csv(path)

        # Example placeholders (replace with real pipeline)
        y_true = df["churn"] if "churn" in df.columns else pd.Series([0]*len(df))
        y_pred = df["churn_probability"] if "churn_probability" in df.columns else pd.Series([0.5]*len(df))

        report = service.generate_report(df, y_true, y_pred)

        logger.save_report(report, req.dataset_id)

        return report

    except Exception as e:
        raise HTTPException(500, str(e))


# --------------------------------------------------
# GET LATEST REPORT
# --------------------------------------------------

@router.get("/report/{dataset_id}")
def get_report(dataset_id: str):

    report = logger.load_latest_report(dataset_id)

    if not report:
        raise HTTPException(404, "No report found")

    return report


# --------------------------------------------------
# DRIFT STATUS (LIGHTWEIGHT)
# --------------------------------------------------

@router.get("/drift-status")
def drift_status():

    try:
        # return latest report drift
        files = list(Path("governance_logs").glob("*.json"))

        if not files:
            return {"features": []}

        latest = sorted(files)[-1]

        import json
        with open(latest) as f:
            data = json.load(f)

        return {"features": data["adwin_results"]}

    except Exception as e:
        raise HTTPException(500, str(e))


# --------------------------------------------------
# CONFIDENCE HISTORY
# --------------------------------------------------

@router.get("/confidence-history/{dataset_id}")
def confidence_history(dataset_id: str):

    try:
        return logger.get_confidence_history(dataset_id)

    except Exception as e:
        raise HTTPException(500, str(e))


# --------------------------------------------------
# FAIRNESS SUMMARY
# --------------------------------------------------

@router.get("/fairness-summary/{dataset_id}")
def fairness_summary(dataset_id: str):

    report = logger.load_latest_report(dataset_id)

    if not report:
        raise HTTPException(404, "No report found")

    return report["fairness_results"]