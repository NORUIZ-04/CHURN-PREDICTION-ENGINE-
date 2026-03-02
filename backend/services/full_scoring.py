import pandas as pd

from services.predictor import predict_dataframe
from services.uplift_model import predict_uplift
from services.survival_model import predict_time_risk


def run_full_scoring(df: pd.DataFrame) -> pd.DataFrame:
    """
    Full scoring pipeline:
    risk → uplift → time-to-churn
    """

    # risk model
    risk_df = predict_dataframe(df)

    # uplift model
    uplift_df = predict_uplift(risk_df)

    # survival / time-to-churn model
    ttc_df = predict_time_risk(uplift_df)

    # normalize column names for routers
    if "churn_probability" in ttc_df.columns:
        ttc_df["risk"] = ttc_df["churn_probability"]

    if "uplift_score" in ttc_df.columns:
        ttc_df["uplift"] = ttc_df["uplift_score"]

    if "predicted_time_to_churn" in ttc_df.columns:
        ttc_df["time_to_churn"] = ttc_df["predicted_time_to_churn"]

    return ttc_df
