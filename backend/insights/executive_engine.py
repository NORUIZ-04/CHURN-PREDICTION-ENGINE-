import pandas as pd
from services.full_scoring import run_full_scoring
from services.decision_engine import build_decisions


def generate_executive_insights(df: pd.DataFrame):
    """
    Real Executive Intelligence Engine
    Converts predictions into leadership-ready intelligence
    """

    # --------------------------------------------------
    # 1️⃣ RUN SCORING PIPELINE
    # --------------------------------------------------
    scored = run_full_scoring(df)

    required = ["risk", "uplift", "time_to_churn"]
    missing = [c for c in required if c not in scored.columns]
    if missing:
        raise ValueError(f"Missing scored columns: {missing}")

    # fallback if dataset lacks value column
    if "monthly_value" not in scored.columns:
        scored["monthly_value"] = 1000

    # --------------------------------------------------
    # 2️⃣ REVENUE RISK INTELLIGENCE
    # --------------------------------------------------
    scored["revenue_risk"] = scored["risk"] * scored["monthly_value"]

    revenue_at_risk = float(scored["revenue_risk"].sum())
    recoverable_revenue = float(
        (scored["revenue_risk"] * scored["uplift"]).sum()
    )

    # --------------------------------------------------
    # 3️⃣ DECISION ENGINE + COST
    # --------------------------------------------------
    decisions = build_decisions(scored)

    total_cost = (
        float(decisions["treatment_cost"].sum())
        if "treatment_cost" in decisions
        else 0
    )

    expected_profit_saved = recoverable_revenue - total_cost

    roi = recoverable_revenue / total_cost if total_cost else 0

    # --------------------------------------------------
    # 4️⃣ OPPORTUNITY SCORING (EXECUTIVE PRIORITY)
    # --------------------------------------------------
    scored["opportunity_score"] = (
        scored["risk"] * 0.5
        + scored["uplift"] * 0.4
        + (1 / (scored["time_to_churn"] + 1)) * 0.1
    )

    top_opportunities = (
        scored.nlargest(10, "opportunity_score")[
            ["risk", "uplift", "time_to_churn", "monthly_value", "opportunity_score"]
        ]
        .round(3)
        .to_dict("records")
    )

    # --------------------------------------------------
    # 5️⃣ URGENCY INTELLIGENCE
    # --------------------------------------------------
    urgent_now = int((scored["time_to_churn"] <= 14).sum())
    urgent_soon = int(
        ((scored["time_to_churn"] > 14) & (scored["time_to_churn"] <= 45)).sum()
    )

    urgency = {
        "critical_now": urgent_now,
        "next_45_days": urgent_soon,
    }

    # --------------------------------------------------
    # 6️⃣ REVENUE LOSS TIMELINE (FORECAST)
    # --------------------------------------------------
    timeline = (
        scored.groupby("time_to_churn")["revenue_risk"]
        .sum()
        .sort_index()
        .head(12)
        .round(2)
    )

    revenue_timeline = [
        {"period": int(idx), "revenue": float(val)}
        for idx, val in timeline.items()
    ]

    # --------------------------------------------------
    # 7️⃣ RISK TREND DETECTION
    # --------------------------------------------------
    risk_series = scored["risk"].rolling(100).mean()

    if len(risk_series.dropna()) > 2:
        trend_value = risk_series.iloc[-1] - risk_series.iloc[0]
        risk_trend = "increasing" if trend_value > 0 else "stable"
    else:
        risk_trend = "stable"

    # --------------------------------------------------
    # 8️⃣ SEGMENT INTELLIGENCE (if segment column exists)
    # --------------------------------------------------
    segment_intelligence = []

    if "segment" in scored.columns:
        segment_stats = (
            scored.groupby("segment")
            .agg(
                customers=("segment", "count"),
                avg_risk=("risk", "mean"),
                revenue_risk=("revenue_risk", "sum"),
            )
            .sort_values("revenue_risk", ascending=False)
            .head(5)
            .reset_index()
        )

        segment_intelligence = segment_stats.round(3).to_dict("records")

    # --------------------------------------------------
    # 9️⃣ URGENT CUSTOMERS SNAPSHOT
    # --------------------------------------------------
    urgent_customers = (
        scored.sort_values("time_to_churn")
        .head(10)[
            ["risk", "time_to_churn", "monthly_value"]
        ]
        .round(3)
        .to_dict("records")
    )

    # --------------------------------------------------
    # 🔟 DECISION SIGNAL ENGINE (EXECUTIVE ALERTS)
    # --------------------------------------------------
    decision_signals = []

    if revenue_at_risk > 1_000_000:
        decision_signals.append("High revenue exposure detected")

    if roi > 2:
        decision_signals.append("Retention campaigns show exceptional ROI potential")

    if urgent_now > len(scored) * 0.1:
        decision_signals.append("Immediate churn surge risk")

    if not decision_signals:
        decision_signals.append("Retention risk within manageable limits")

    # --------------------------------------------------
    # 11️⃣ EXECUTIVE SUMMARY
    # --------------------------------------------------
    summary = (
        f"₹{int(revenue_at_risk):,} revenue at risk. "
        f"Targeted retention can recover ₹{int(recoverable_revenue):,}. "
        f"{urgent_now} customers require immediate attention."
    )

    # --------------------------------------------------
    # FINAL RESPONSE
    # --------------------------------------------------
    return {
        "executive_summary": summary,

        "revenue_impact": {
            "revenue_at_risk": revenue_at_risk,
            "recoverable_revenue": recoverable_revenue,
            "expected_profit_saved": expected_profit_saved,
            "roi": round(roi, 2),
        },

        "urgency": urgency,

        "risk_trend": risk_trend,

        "revenue_timeline": revenue_timeline,

        "segment_intelligence": segment_intelligence,

        "top_opportunities": top_opportunities,

        "urgent_customers": urgent_customers,

        "decision_signals": decision_signals,
    }