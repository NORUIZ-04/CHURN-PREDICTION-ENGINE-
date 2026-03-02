def calculate_revenue_impact(df, churn_df, uplift_df, decisions_df):

    data = df.copy()

    data["churn_probability"] = churn_df["churn_probability"]
    data["uplift_score"] = uplift_df["uplift_score"]

    if "monthly_value" not in data.columns:
        raise ValueError("monthly_value column required")

    data["revenue_at_risk"] = data["monthly_value"] * data["churn_probability"]
    data["recoverable"] = data["revenue_at_risk"] * data["uplift_score"]

    total_risk = data["revenue_at_risk"].sum()
    recoverable = data["recoverable"].sum()

    total_cost = decisions_df["treatment_cost"].sum()
    profit_saved = recoverable - total_cost

    return {
        "revenue_at_risk": round(float(total_risk), 2),
        "recoverable_revenue": round(float(recoverable), 2),
        "expected_profit_saved": round(float(profit_saved), 2)
    }