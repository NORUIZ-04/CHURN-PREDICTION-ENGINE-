def generate_insights(df):
    total_customers = len(df)

    high_risk = (df["churn_probability"] > 0.7).sum()
    medium_risk = ((df["churn_probability"] > 0.4) &
                   (df["churn_probability"] <= 0.7)).sum()

    avg_ttc = round(df["time_to_churn"].mean(), 1)

    insights = {
        "total_customers": total_customers,
        "high_risk_customers": int(high_risk),
        "medium_risk_customers": int(medium_risk),
        "average_time_to_churn_months": avg_ttc,
        "predicted_retention_improvement":
            round(df["uplift_score"].mean() * 100, 2)
    }

    return insights