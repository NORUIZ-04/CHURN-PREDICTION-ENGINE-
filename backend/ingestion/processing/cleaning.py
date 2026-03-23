import pandas as pd
from ingestion.utils.logger import get_logger

logger = get_logger()


def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Basic cleaning operations.
    """

    logger.info("Starting data cleaning")

    df = df.copy()

    # remove duplicate rows
    before = len(df)
    df.drop_duplicates(inplace=True)
    after = len(df)

    if before != after:
        logger.warning(f"Removed {before - after} duplicate rows")

    # strip whitespace from string columns
    for col in df.select_dtypes(include="object").columns:
        df[col] = df[col].astype(str).str.strip()

    # normalize empty strings to NaN
    df.replace({"": pd.NA, "NA": pd.NA, "null": pd.NA}, inplace=True)

    logger.info("Cleaning complete")

    return df