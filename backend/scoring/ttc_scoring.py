import pandas as pd

def predict_ttc(df: pd.DataFrame):
    """
    Estimate months until churn.
    """

    df["time_to_churn"] = (
        24 - df["tenure"] * 0.3 - df["service_call_rate"] * 5
    ).clip(lower=1)

    return df