from fastapi import APIRouter, HTTPException
import pandas as pd

from services.predictor import predict_dataframe
from services.feature_engineering import apply_feature_pipeline

router = APIRouter(prefix="/simulate", tags=["simulator"])


REQUIRED_BASE = [
    "age",
    "tenure",
    "plan_type",
    "monthly_usage",
    "engagement_score",
    "complaints",
    "payment_delay"
]


@router.post("/action")
def simulate_action(payload: dict):
    try:
        row = payload.get("row", {})
        action = payload.get("action", "discount")

        # -------- ensure required columns --------

        for col in REQUIRED_BASE:
            row.setdefault(col, 0)

        df = pd.DataFrame([row])
        if "plan_type" in df.columns:
            df["plan_type"] = df["plan_type"].astype(str)

        # -------- feature engineering --------

        df = apply_feature_pipeline(df)

        # -------- base prediction --------

        base_pred = predict_dataframe(df)
        base_prob = float(base_pred["churn_probability"].iloc[0])

        # -------- simulate --------

        df_sim = df.copy()

        if action == "discount":
            df_sim["discount_percent"] = df_sim.get("discount_percent", 0) + 10

        elif action == "call":
            df_sim["engagement_score"] += 0.1

        elif action == "support":
            df_sim["complaints"] *= 0.7

        sim_pred = predict_dataframe(df_sim)
        sim_prob = float(sim_pred["churn_probability"].iloc[0])

        return {
            "base_probability": base_prob,
            "simulated_probability": sim_prob,
            "delta": sim_prob - base_prob,
            "action": action
        }

    except Exception as e:
        print("SIMULATE ERROR:", str(e))
        # It is best practice to use named arguments for HTTPException
        raise HTTPException(status_code=500, detail=str(e))
