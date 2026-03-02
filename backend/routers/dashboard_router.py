from fastapi import APIRouter, HTTPException
import pandas as pd
import numpy as np
import traceback

from config import PROCESSED_DATA_DIR
from services.full_scoring import run_full_scoring

router = APIRouter(
    prefix="/dashboard",
    tags=["dashboard"]
)

@router.get("/command-center")
def command_center(dataset: str):
    try:
        path = PROCESSED_DATA_DIR / dataset

        if not path.exists():
            raise HTTPException(404, "Dataset not found")

        df = pd.read_csv(path)
        scored = run_full_scoring(df)

        required = ["risk", "uplift", "time_to_churn"]
        for col in required:
            if col not in scored.columns:
                raise HTTPException(500, f"Missing column: {col}")

        if "monthly_value" not in scored.columns:
            scored["monthly_value"] = 1000

        scored = scored.fillna(0)

        # =========================
        # OPPORTUNITY SCORE
        # =========================
        scored["opportunity_score"] = (
            scored["risk"] *
            scored["uplift"] *
            scored["monthly_value"]
        )

        # =========================
        # URGENCY SCORE
        # =========================
        scored["urgency_score"] = (
            scored["risk"] * 0.5 +
            scored["uplift"] * 0.3 +
            (1 / (scored["time_to_churn"] + 1)) * 0.2
        )

        # =========================
        # URGENCY TIERS
        # =========================

        def urgency_tier(row):
            if row["urgency_score"] >= 0.75:
                return "critical"
            elif row["urgency_score"] >= 0.55:
                return "high"
            elif row["urgency_score"] >= 0.35:
                return "medium"
            else:
                return "low"

        scored["urgency_tier"] = scored.apply(urgency_tier, axis=1)

        urgency_counts = (
            scored["urgency_tier"]
            .value_counts()
            .to_dict()
        )

        # =========================
        # LIVE CHURN TREND
        # =========================
        churn_trend = (
            scored["risk"]
            .rolling(window=50, min_periods=1)
            .mean()
            .tolist()
        )

        # =========================
        # URGENCY HEATMAP
        # =========================
        heatmap = scored[["risk", "uplift", "urgency_score"]] \
            .head(200) \
            .values.tolist()

        # =========================
        # EXECUTIVE SIGNALS
        # =========================
        signals = []

        urgent_count = int((scored["time_to_churn"] < 30).sum())
        high_value_opportunity = float(scored["opportunity_score"].sum())

        if urgent_count > 0:
            signals.append(f"{urgent_count} customers nearing churn window")

        if high_value_opportunity > 0:
            signals.append("High revenue recovery opportunity detected")

        if scored["uplift"].mean() > 0.3:
            signals.append("Retention campaigns likely to perform strongly")

        if scored["risk"].mean() > 0.5:
            signals.append("Churn risk trending high — immediate action advised")

        result = {
            "customers": int(len(scored)),
            "churn_rate": float(scored["risk"].mean()),
            "revenue_at_risk": float(
                (scored["risk"] * scored["monthly_value"]).sum()
            ),
            "recoverable_revenue": float(
                (scored["uplift"] * scored["monthly_value"]).sum()
            ),
            "urgent_customers": urgent_count,

            "risk_distribution": scored["risk"].tolist(),
            "ttc_distribution": scored["time_to_churn"].tolist(),
            "urgency_distribution": urgency_counts,

            "churn_trend": churn_trend,
            "urgency_heatmap": heatmap,

            "top_opportunities": (
                scored.sort_values("opportunity_score", ascending=False)
                .head(10)
                .to_dict("records")
            ),

            "signals": signals
        }

        return result

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(500, str(e))