import pandas as pd
from ingestion.utils.logger import get_logger

logger = get_logger()


def normalize_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Normalize data types and handle missing values.
    """

    logger.info("Normalizing dataset")

    df = df.copy()

    numeric_columns = [
        "tenure",
        "monthly_charges",
        "total_charges",
        "keeps_service_calls",
        "support_tickets",
        "late_payments",
        "avg_monthly_usage"
    ]

    boolean_columns = [
        "is_senior",
        "has_dependents"
    ]

    # ------------------------------------------------
    # FIX TELCO TOTAL CHARGES
    # ------------------------------------------------

    if "total_charges" in df.columns:

        df["total_charges"] = df["total_charges"].replace(" ", None)

    # ------------------------------------------------
    # NUMERIC CONVERSION
    # ------------------------------------------------

    for col in numeric_columns:

        if col in df.columns:

            df[col] = pd.to_numeric(df[col], errors="coerce")

    # ------------------------------------------------
    # BOOLEAN CONVERSION
    # ------------------------------------------------

    for col in boolean_columns:

        if col in df.columns:

            df[col] = (
                df[col]
                .astype(str)
                .str.lower()
                .map(
                    {
                        "true": True,
                        "1": True,
                        "yes": True,
                        "false": False,
                        "0": False,
                        "no": False
                    }
                )
            )

    # ------------------------------------------------
    # FILL NUMERIC
    # ------------------------------------------------

    for col in numeric_columns:

        if col in df.columns:

            median_val = df[col].median()

            df[col] = df[col].fillna(median_val)

    # ------------------------------------------------
    # FILL BOOLEAN
    # ------------------------------------------------

    for col in boolean_columns:

        if col in df.columns:

            df[col] = df[col].fillna(False)

    logger.info("Normalization complete")

    return df