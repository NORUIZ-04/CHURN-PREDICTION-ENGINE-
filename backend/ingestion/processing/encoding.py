import pandas as pd
from ingestion.utils.logger import get_logger

logger = get_logger()


def encode_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Encode categorical features for ML compatibility.
    """

    logger.info("Encoding categorical features")

    df = df.copy()

    categorical_columns = [
        "contract_type",
        "internet_service",
        "payment_method",
        "tenure_bucket"
    ]

    existing = [col for col in categorical_columns if col in df.columns]

    if existing:
        df = pd.get_dummies(df, columns=existing, drop_first=True)

    logger.info(f"Encoded columns: {existing}")

    return df