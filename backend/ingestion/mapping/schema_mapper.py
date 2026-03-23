import pandas as pd
import yaml
from pathlib import Path
from difflib import get_close_matches
from ingestion.utils.logger import get_logger

logger = get_logger()

CONFIG_DIR = Path(__file__).resolve().parents[1] / "config"


def load_yaml(filename):
    with open(CONFIG_DIR / filename, "r") as f:
        return yaml.safe_load(f)


feature_schema = load_yaml("feature_schema.yaml")
column_mapping = load_yaml("column_mapping.yaml")


def normalize_column_name(name: str) -> str:
    return name.strip().lower().replace(" ", "_")


def find_mapping(source_col, mapping_dict):
    """
    Match a source column to canonical feature name.
    """

    source_col_norm = normalize_column_name(source_col)

    for canonical, variants in mapping_dict.items():

        if source_col_norm == canonical:
            return canonical

        if source_col_norm in variants:
            return canonical

        matches = get_close_matches(source_col_norm, variants, n=1, cutoff=0.8)

        if matches:
            return canonical

    return None


def map_schema(df: pd.DataFrame, config: dict = None) -> pd.DataFrame:
    """
    Map dataset columns to canonical feature schema.
    """

    logger.info("Mapping dataset schema")

    df = df.copy()

    # normalize column names
    df.columns = [normalize_column_name(c) for c in df.columns]

    rename_dict = {}

    for col in df.columns:

        mapped = find_mapping(col, column_mapping)

        if mapped:
            rename_dict[col] = mapped

    df.rename(columns=rename_dict, inplace=True)

    logger.info(f"Mapped columns: {rename_dict}")

    # ------------------------------------------------
    # REQUIRED FEATURES
    # ------------------------------------------------

    strict_required = [
        "tenure",
        "monthly_charges",
        "contract_type"
    ]

    for feature in strict_required:

        if feature not in df.columns:
            raise ValueError(f"Missing required feature: {feature}")

    # ------------------------------------------------
    # DERIVABLE FEATURES
    # ------------------------------------------------

    derivable_features = [
        "total_charges"
    ]

    for feature in derivable_features:

        if feature not in df.columns:
            logger.warning(f"{feature} missing — will be derived during feature engineering")

    # ------------------------------------------------
    # DEFAULT FEATURES
    # ------------------------------------------------

    defaults = feature_schema.get("default_values", {})

    for feature, default in defaults.items():

        if feature not in df.columns:

            df[feature] = default

            logger.warning(f"Added missing feature '{feature}' with default")

    return df