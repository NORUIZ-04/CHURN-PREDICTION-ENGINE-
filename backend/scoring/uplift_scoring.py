import pandas as pd

def compute_uplift(df: pd.DataFrame):
    """
    Estimate retention impact of intervention.
    """

    df["uplift_score"] = (1 - df["churn_probability"]) * 0.25

    return df