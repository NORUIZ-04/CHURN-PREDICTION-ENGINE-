import pandas as pd
from ingestion.utils.logger import get_logger

logger = get_logger()

def profile_schema(df: pd.DataFrame) -> dict:
    """
    Analyze dataframe structure and data quality.
    """

    logger.info("Profiling dataset schema")

    profile = {
        "row_count": len(df),
        "column_count": len(df.columns),
        "columns": [],
        "missing_summary": {},
        "numeric_summary": {},
        "categorical_summary": {}
    }

    for col in df.columns:
        col_data = df[col]

        col_profile = {
            "name": col,
            "dtype": str(col_data.dtype),
            "missing_pct": float(col_data.isna().mean() * 100),
            "unique_values": int(col_data.nunique())
        }

        profile["columns"].append(col_profile)

        if col_data.dtype in ["int64", "float64"]:
            profile["numeric_summary"][col] = {
                "min": float(col_data.min()) if not col_data.isna().all() else None,
                "max": float(col_data.max()) if not col_data.isna().all() else None,
                "mean": float(col_data.mean()) if not col_data.isna().all() else None
            }
        else:
            top_values = col_data.value_counts().head(5).to_dict()
            profile["categorical_summary"][col] = top_values

        profile["missing_summary"][col] = col_profile["missing_pct"]

    logger.info("Schema profiling completed")

    return profile