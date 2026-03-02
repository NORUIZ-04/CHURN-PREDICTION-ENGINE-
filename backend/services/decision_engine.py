import pandas as pd
import numpy as np

from services.predictor import predict_dataframe
from services.uplift_model import predict_uplift
from services.survival_model import predict_time_risk
from services.explainer import explain_dataframe
from services.budget_optimizer import compute_value_metrics


# --------------------------------------------------
# Action Mapping Rules
# --------------------------------------------------

def map_action(drivers):

    if not drivers:
        return "standard_discount"

    names = [d["feature"] for d in drivers]
    for d in drivers:
        f = d["feature"]
        clean = f.split("__")[-1]  # <--- Added your line here
        names.append(clean)
    if any("complaints" in n for n in names):
        return "priority_service_call"

    if any("payment_delay" in n for n in names):
        return "flexible_payment_plan"

    if any("engagement" in n for n in names):
        return "loyalty_reward_offer"
    
    return "standard_discount"


# --------------------------------------------------
# Main Decision Builder
# --------------------------------------------------
def build_decisions(df, budget=None, top_k_drivers=3):

    # ---------- prediction stack ----------
    risk_df = predict_dataframe(df)
    uplift_df = predict_uplift(risk_df)
    time_df = predict_time_risk(uplift_df)

    value_df = compute_value_metrics(time_df).copy()

    if "customer_id" not in value_df.columns:
        value_df["customer_id"] = value_df.index.astype(int)

    # ---------- base decision rows ----------
    rows = []

    for _, row in value_df.iterrows():

        ttc = float(row.get("predicted_time_to_churn", 999))

        if ttc < 6:
            urgency = "high"
        elif ttc < 18:
            urgency = "medium"
        else:
            urgency = "low"

        urgency_weight = {
            "high": 1.3,
            "medium": 1.0,
            "low": 0.7
        }[urgency]

        priority_score = (
            row["uplift_score"] * 0.5 +
            row["roi"] * 0.3 +
            urgency_weight * 0.2
        )

        recommend = (
            priority_score > 0.25 and
            row["expected_profit"] > 0
        )


        rows.append({
            "customer_id": int(row["customer_id"]),
            "risk": float(row["churn_probability"]),
            "time_to_churn": float(ttc),
            "uplift": float(row["uplift_score"]),
            "expected_profit": float(row["expected_profit"]),
            "roi": float(row["roi"]),
            "urgency": urgency,
            "recommend": bool(recommend),
            "priority_score": float(priority_score),
        })

    out = pd.DataFrame(rows)

    # ---------- budget filter first ----------
    if budget is not None:

        out = out[out["recommend"]]
        out = out.sort_values(["priority_score", "roi"],ascending=False)


        spent = 0
        selected = []

        for _, r in out.iterrows():

            cost = float(
                value_df.loc[
                    value_df["customer_id"] == r["customer_id"],
                    "retention_cost"
                ].values[0]
            )

            if spent + cost <= budget:
                selected.append(r)
                spent += cost

        out = pd.DataFrame(selected)

    # ---------- NOW RUN SHAP ON SELECTED ----------
    if len(out) > 0:

        explain_df = df[
            df["customer_id"].isin(out["customer_id"])
        ].copy()

        explanations = explain_dataframe(
            explain_df,
            top_k_drivers
        )

        explain_map = dict(
            zip(explain_df["customer_id"], explanations)
        )

        drivers_list = []
        actions = []

        for cid in out["customer_id"]:

            drivers = explain_map.get(cid, [])
            drivers_list.append(drivers)
            actions.append(map_action(drivers))

        out["drivers"] = drivers_list
        out["recommended_action"] = actions

    else:
        out["drivers"] = []
        out["recommended_action"] = "standard_discount"

    return out
