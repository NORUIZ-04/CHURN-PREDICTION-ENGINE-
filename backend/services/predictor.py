import pandas as pd

from services.model_loader import get_model
from services.feature_engineering import apply_feature_pipeline

from services.model_loader import (
    get_model,
    get_uplift_model)


# ================================
# columns not used for prediction
# ================================

DROP_COLS = [
    "churn",
    "customer_id",
    "time_to_churn"
]


# =========================================
# model-required engineered feature columns
# (must match training pipeline)
# =========================================

REQUIRED_MODEL_COLUMNS = [
    "retention_cost",
    "CLV",
    "discount_percent",
    "service_pain_index",
    "treatment_value_ratio",
    "charge_ratio",
    "usage_volatility",
    "shock_flag",
    "value_density",
    "treatment_flag",
    "risk_behavior_score"
]


# ================================
# ensure required columns exist
# ================================

def ensure_columns(df: pd.DataFrame) -> pd.DataFrame:

    df = df.copy()

    for col in REQUIRED_MODEL_COLUMNS:
        if col not in df.columns:
            df[col] = 0

    return df

def coerce_dtypes(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()

    # force known categorical columns to string
    for col in ["plan_type"]:
        if col in df.columns:
            df[col] = df[col].astype(str)

    return df

# ================================
# drop non-feature columns
# ================================

def prepare_features(df: pd.DataFrame) -> pd.DataFrame:

    return df.drop(
        columns=DROP_COLS,
        errors="ignore"
    )


# ================================
# full preprocessing before model
# ================================

def prepare_model_input(df: pd.DataFrame) -> pd.DataFrame:

    df = df.copy()

    # ✅ force safe dtypes
    df = coerce_dtypes(df)

    # engineered features
    df = apply_feature_pipeline(df)

    # required engineered columns
    df = ensure_columns(df)

    # drop labels
    X = prepare_features(df)

    return X


# ================================
# main prediction function
# ================================

def predict_dataframe(df: pd.DataFrame) -> pd.DataFrame:

    model = get_model()

    # unified preprocessing
    X = prepare_model_input(df)

    probs = model.predict_proba(X)[:, 1]

    threshold = 0.5
    preds = (probs >= threshold).astype(int)

    out = df.copy()
    out["churn_probability"] = probs
    out["churn_prediction"] = preds

    return out

# ================================
# FULL SCORING ENGINE
# ================================

def run_full_scoring(df: pd.DataFrame) -> pd.DataFrame:

    df = df.copy()

    # ===== churn risk =====
    churn_scored = predict_dataframe(df)

    # normalize naming used by your routers
    churn_scored["risk"] = churn_scored["churn_probability"]

    # ===== uplift =====
    try:
        uplift_model = get_uplift_model()
        X = prepare_model_input(df)
        churn_scored["uplift"] = uplift_model.predict(X)
    except:
        churn_scored["uplift"] = 0.0

    # ===== time to churn =====
    try:
        ttc_model = get_ttc_model()
        X = prepare_model_input(df)
        churn_scored["time_to_churn"] = ttc_model.predict(X)
    except:
        churn_scored["time_to_churn"] = 999

    # ===== expected profit =====
    if "CLV" in churn_scored.columns:
        churn_scored["expected_profit"] = (
            churn_scored["uplift"] * churn_scored["CLV"]
        )
    else:
        churn_scored["expected_profit"] = 0

    return churn_scored