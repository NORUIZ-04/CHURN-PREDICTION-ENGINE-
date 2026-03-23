import pandas as pd

def score_churn(df: pd.DataFrame):
    """
    Replace with your trained churn model.
    """

    # dummy scoring logic (replace with model.predict_proba)
    churn_prob = df["service_call_rate"].fillna(0) * 0.6 + 0.2

    df["churn_probability"] = churn_prob.clip(0, 1)

    return df