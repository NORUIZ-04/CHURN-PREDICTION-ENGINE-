def evaluate_budget_efficiency(decisions_df, revenue):

    total_spend = decisions_df["treatment_cost"].sum()

    roi = (
        revenue["recoverable_revenue"] / total_spend
        if total_spend > 0 else 0
    )

    return {
        "total_spend": round(float(total_spend), 2),
        "roi_per_dollar": round(float(roi), 2)
    }