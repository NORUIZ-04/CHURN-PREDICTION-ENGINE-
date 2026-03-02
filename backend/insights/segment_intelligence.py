def segment_risk_analysis(df, churn_df, uplift_df):

    data = df.copy()
    data["churn_probability"] = churn_df["churn_probability"]
    data["uplift_score"] = uplift_df["uplift_score"]

    if "value_tier" not in data.columns:
        return []

    grouped = (
        data.groupby("value_tier")
        .agg(
            customers=("churn_probability", "count"),
            churn_rate=("churn_probability", "mean"),
            uplift_avg=("uplift_score", "mean"),
            monthly_value=("monthly_value", "mean")
        )
        .reset_index()
    )

    alerts = []

    for _, row in grouped.iterrows():
        if row["churn_rate"] > 0.6:
            alerts.append({
                "segment": row["value_tier"],
                "risk_level": "Critical",
                "customers": int(row["customers"]),
                "avg_monthly_value": round(row["monthly_value"], 2)
            })

    return alerts
