import pandas as pd
from ingestion.utils.logger import get_logger

logger = get_logger()


REQUIRED_FEATURES = [
    "tenure",
    "monthly_charges",
    "total_charges",
    "contract_type"
]


def validate_dataset(df: pd.DataFrame) -> dict:
    """
    Validate dataset integrity & quality.
    Returns validation report and quality score.
    """

    logger.info("Validating dataset")

    report = {
        "missing_required_features": [],
        "high_missing_columns": [],
        "negative_values": [],
        "anomalies": [],
        "quality_score": 100
    }

    # ✔ Check required features
    for feature in REQUIRED_FEATURES:
        if feature not in df.columns:
            report["missing_required_features"].append(feature)

    # ✔ Missing value thresholds
    for col in df.columns:
        missing_pct = df[col].isna().mean()

        if missing_pct > 0.30:
            report["high_missing_columns"].append(
                {"column": col, "missing_pct": round(missing_pct * 100, 2)}
            )

    # ✔ Negative value checks (invalid for these)
    non_negative_cols = [
        "tenure",
        "monthly_charges",
        "total_charges",
        "avg_monthly_usage"
    ]

    for col in non_negative_cols:
        if col in df.columns and (df[col] < 0).any():
            report["negative_values"].append(col)

    # ✔ Anomaly detection (extreme outliers)
    for col in df.select_dtypes(include="number").columns:
        if df[col].std() == 0 or df[col].isna().all():
            continue

        z_scores = (df[col] - df[col].mean()) / df[col].std()
        outliers = (z_scores.abs() > 4).sum()

        if outliers > 0:
            report["anomalies"].append(
                {"column": col, "outlier_count": int(outliers)}
            )

    # ✔ Quality scoring
    penalty = (
        len(report["missing_required_features"]) * 20 +
        len(report["high_missing_columns"]) * 5 +
        len(report["negative_values"]) * 10 +
        len(report["anomalies"]) * 2
    )

    report["quality_score"] = max(0, 100 - penalty)

    logger.info(f"Validation complete. Quality Score: {report['quality_score']}")

    return report