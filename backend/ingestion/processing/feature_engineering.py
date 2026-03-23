import pandas as pd
from ingestion.utils.logger import get_logger

logger = get_logger()


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Create derived features required by models.
    """

    logger.info("Starting feature engineering")

    df = df.copy()

    # ------------------------------------------------
    # Total Charges
    # ------------------------------------------------
    if "total_charges" not in df.columns or df["total_charges"].isna().all():
        if {"tenure", "monthly_charges"}.issubset(df.columns):
            df["total_charges"] = df["tenure"] * df["monthly_charges"]
            logger.info("Derived total_charges")

    # ------------------------------------------------
    # Tenure Bucket
    # ------------------------------------------------
    if "tenure" in df.columns:
        df["tenure_bucket"] = pd.cut(
            df["tenure"],
            bins=[0, 6, 12, 24, 48, 120],
            labels=["0-6m", "6-12m", "1-2y", "2-4y", "4y+"]
        )

    # ------------------------------------------------
    # Service Call Rate
    # ------------------------------------------------
    if {"keeps_service_calls", "tenure"}.issubset(df.columns):
        df["service_call_rate"] = df["keeps_service_calls"] / (df["tenure"] + 1)

    # ------------------------------------------------
    # Payment Issues
    # ------------------------------------------------
    if "late_payments" in df.columns:
        df["has_payment_issues"] = df["late_payments"] > 0

    # ------------------------------------------------
    # Churn Label
    # ------------------------------------------------
    if "churn" not in df.columns and "churn_label" in df.columns:
        df["churn"] = df["churn_label"]

    if "churn" in df.columns:
        df["churn"] = df["churn"].astype(str).str.lower().map(
            {"yes": 1, "no": 0, "true": 1, "false": 0, "1": 1, "0": 0}
        )

    logger.info("Feature engineering complete")

    return df