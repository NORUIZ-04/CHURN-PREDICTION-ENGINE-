import pandas as pd

def analyze_risk_drivers(df, churn_df, top_n=5):

    data = df.copy()
    data["churn_probability"] = churn_df["churn_probability"]

    numeric_cols = data.select_dtypes(include="number").columns.tolist()

    correlations = (
        data[numeric_cols]
        .corr()["churn_probability"]
        .drop("churn_probability")
        .abs()
        .sort_values(ascending=False)
        .head(top_n)
    )

    drivers = [
        {
            "factor": col,
            "impact_strength": round(val, 3)
        }
        for col, val in correlations.items()
    ]

    return drivers
