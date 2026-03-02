import pandas as pd
from services.full_scoring import run_full_scoring
from services.decision_engine import build_decisions

def generate_executive_insights(df):

    # 🔹 Run scoring (same engine TTC uses)
    scored = run_full_scoring(df)

    required = ["risk", "uplift", "time_to_churn"]

    missing = [c for c in required if c not in scored.columns]
    if missing:
        raise ValueError(f"Missing scored columns: {missing}")

    # 🔹 Revenue risk
    if "monthly_value" not in scored.columns:
        scored["monthly_value"] = 1000  # safe fallback

    scored["revenue_risk"] = scored["risk"] * scored["monthly_value"]

    revenue_at_risk = float(scored["revenue_risk"].sum())
    recoverable = float((scored["revenue_risk"] * scored["uplift"]).sum())

    # 🔹 Build decisions using your decision engine
    decisions = build_decisions(scored)

    total_cost = decisions["treatment_cost"].sum() if "treatment_cost" in decisions else 0

    profit_saved = recoverable - total_cost

    # 🔹 Risk drivers (simple)
    top_risk = scored.sort_values("risk", ascending=False).head(5)

    # 🔹 Urgent customers
    urgent = scored.sort_values("time_to_churn").head(10)

    return {
        "executive_summary":
            f"₹{int(revenue_at_risk):,} revenue at risk. "
            f"Targeted retention can recover ₹{int(recoverable):,}.",

        "revenue_impact": {
            "revenue_at_risk": revenue_at_risk,
            "recoverable_revenue": recoverable,
            "expected_profit_saved": profit_saved
        },

        "risk_drivers": [
            {"factor": "High churn risk concentration", "impact_strength": 0.9}
        ],

        "emerging_patterns": [
            "Customers with low time-to-churn require immediate action"
        ],

        "segment_alerts": [],

        "budget_efficiency": {
            "total_spend": float(total_cost),
            "roi_per_dollar": recoverable / total_cost if total_cost else 0
        },

        "opportunities": {
            "high_opportunity_customers": int(len(urgent)),
        },

        "strategic_recommendations": [
            "Prioritize high-risk customers",
            "Focus on customers nearing churn",
            "Target high uplift segments"
        ]
    }