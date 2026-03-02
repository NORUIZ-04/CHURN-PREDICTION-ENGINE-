import shap
import pandas as pd
import numpy as np

from services.model_loader import get_model
from services.feature_engineering import apply_feature_pipeline
from services.predictor import prepare_features
from services.predictor import ensure_columns

_explainer = None
_feature_names = None


# =============================

def _prepare_model_input(df: pd.DataFrame):

    df = df.copy()

    # ensure base model columns exist
    df = ensure_columns(df)

    # feature engineering
    df = apply_feature_pipeline(df)

    # drop label/id columns
    X_df = prepare_features(df)

    return X_df


# =============================

def get_explainer_and_features(background_df):

    global _explainer, _feature_names

    if _explainer is not None:
        return _explainer, _feature_names

    model = get_model()

    prep = model.named_steps["prep"]
    clf = model.named_steps["model"]

    X_bg_df = _prepare_model_input(background_df)

    X_bg = prep.transform(X_bg_df)

    _feature_names = prep.get_feature_names_out()

    _explainer = shap.Explainer(
        clf.predict_proba,
        X_bg,
        algorithm="permutation"
    )

    return _explainer, _feature_names


# =============================

def explain_dataframe(df: pd.DataFrame, top_k=3):

    model = get_model()
    prep = model.named_steps["prep"]

    # ✅ SAME preprocessing as predictor
    X_df = _prepare_model_input(df)

    X = prep.transform(X_df)

    bg = df.sample(min(len(df), 50), random_state=42)

    explainer, feature_names = get_explainer_and_features(bg)

    shap_values = explainer(X)

    vals = shap_values.values[:, :, 1]

    results = []

    for row_vals in vals:

        pairs = list(zip(feature_names, row_vals))

        pairs.sort(
            key=lambda x: abs(x[1]),
            reverse=True
        )

        top = pairs[:top_k]

        results.append([
            {
                "feature": str(f),
                "impact": float(v)
            }
            for f, v in top
        ])

    return results


# =============================

def global_importance_for_df(df, top_k=20):

    model = get_model()
    prep = model.named_steps["prep"]

    X_df = _prepare_model_input(df)

    X = prep.transform(X_df)

    bg = df.sample(min(len(df), 50), random_state=42)

    explainer, feature_names = get_explainer_and_features(bg)

    shap_values = explainer(X)

    vals = shap_values.values[:, :, 1]

    mean_abs = np.abs(vals).mean(axis=0)

    pairs = list(zip(feature_names, mean_abs))

    pairs.sort(key=lambda x: x[1], reverse=True)

    return [
        {
            "feature": str(f),
            "importance": float(v)
        }
        for f, v in pairs[:top_k]
    ]
