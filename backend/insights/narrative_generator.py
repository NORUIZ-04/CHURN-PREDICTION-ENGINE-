def generate_narrative(drivers, segments, revenue, opportunities, patterns):

    driver_text = drivers[0]["factor"] if drivers else "multiple behavioral factors"

    summary = (
        f"Churn risk is primarily driven by {driver_text}. "
        f"₹{revenue['revenue_at_risk']:,} in revenue is at risk, with "
        f"₹{revenue['recoverable_revenue']:,} recoverable through targeted interventions. "
        f"{opportunities['high_opportunity_customers']} high-value customers present immediate retention opportunities."
    )

    if patterns:
        summary += " Emerging patterns indicate: " + "; ".join(patterns) + "."

    return summary