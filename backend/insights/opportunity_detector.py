def detect_opportunities(df, uplift_df, churn_df):

    data = df.copy()
    data["uplift"] = uplift_df["uplift_score"]
    data["risk"] = churn_df["churn_probability"]

    high_value = data[data["monthly_value"] > data["monthly_value"].quantile(0.7)]
    high_opportunity = high_value[(high_value["uplift"] > 0.6) & (high_value["risk"] > 0.6)]

    return {
        "high_opportunity_customers": int(len(high_opportunity)),
        "recommendations": [
            "Prioritize high-value customers with high churn risk",
            "Target high uplift segments for maximum ROI",
            "Deploy immediate retention actions for TTC < 30 days"
        ]
    }