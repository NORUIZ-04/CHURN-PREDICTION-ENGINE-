import pandas as pd

def clean_telco(df: pd.DataFrame):

    df = df.copy()

    if "Churn" in df.columns:
        df["Churn"] = df["Churn"].map({
            "Yes": 1,
            "No": 0,
            1: 1,
            0: 0
        })

    if "TotalCharges" in df.columns:
        df["TotalCharges"] = pd.to_numeric(
            df["TotalCharges"],
            errors="coerce"
        )

    # Fill missing numeric
    df = df.fillna(df.median(numeric_only=True))

    return df
