def detect_patterns(df, churn_df, ttc_df):

    insights = []

    high_risk_ratio = (churn_df["churn_probability"] > 0.7).mean()
    if high_risk_ratio > 0.25:
        insights.append(
            f"High-risk customers exceed {round(high_risk_ratio*100)}% of the base"
        )

    urgent_ratio = (ttc_df["ttc_days"] < 30).mean()
    if urgent_ratio > 0.2:
        insights.append(
            f"{round(urgent_ratio*100)}% customers may churn within 30 days"
        )

    if "engagement_score" in df.columns:
        low_engagement = (df["engagement_score"] < 40).mean()
        if low_engagement > 0.3:
            insights.append(
                "Engagement decline is accelerating churn risk"
            )

    return insights