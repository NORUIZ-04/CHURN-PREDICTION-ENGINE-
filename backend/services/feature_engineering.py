import pandas as pd

BASE_DEFAULTS = {
    "CLV": 0,
    "discount_percent": 0,
    "usage_volatility": 0,
    "retention_cost": 0,
    "shock_flag": 0,
    "treatment_flag": 0
}

def ensure_base_columns(df):
    df = df.copy()

    for c, v in BASE_DEFAULTS.items():
        if c not in df.columns:
            df[c] = v

    return df

def _num(df, col):
    """safe numeric conversion"""
    if col in df.columns:
        return pd.to_numeric(df[col], errors="coerce").fillna(0)
    return 0

def basic_features(df: pd.DataFrame):

    df = df.copy()

    if {"monthly_usage", "CLV"} <= set(df.columns):
        mu = _num(df, "monthly_usage")
        clv = _num(df, "CLV")
        df["charge_ratio"] = mu / (clv + 1)
    else:
        df["charge_ratio"] = 0

    return df


def advanced_features(df: pd.DataFrame):

    df = df.copy()

    if {"usage_volatility", "engagement_score"} <= set(df.columns):
        df["risk_behavior_score"] = (
            _num(df, "usage_volatility") *
            (1 - _num(df, "engagement_score"))
        )
    else:
        df["risk_behavior_score"] = 0

    if {"complaints", "payment_delay"} <= set(df.columns):
        df["service_pain_index"] = (
            _num(df, "complaints") *
            _num(df, "payment_delay")
        )
    else:
        df["service_pain_index"] = 0

    if {"CLV", "tenure"} <= set(df.columns):
        df["value_density"] = (
            _num(df, "CLV") /
            (_num(df, "tenure") + 1)
        )
    else:
        df["value_density"] = 0

    if {"discount_percent", "CLV"} <= set(df.columns):
        df["treatment_value_ratio"] = (
            _num(df, "discount_percent") /
            (_num(df, "CLV") + 1)
        )
    else:
        df["treatment_value_ratio"] = 0

    return df


def apply_feature_pipeline(df: pd.DataFrame):
    df = ensure_base_columns(df)
    df = basic_features(df)
    df = advanced_features(df)
    return df
