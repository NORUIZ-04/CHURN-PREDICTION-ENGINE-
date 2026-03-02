import pandas as pd
import numpy as np
import joblib
from pathlib import Path
from xgboost import XGBClassifier


# ==========================================
# Config
# ==========================================

MODEL_PATH = Path("models/uplift_model.pkl")

DROP_COLS = [
    "customer_id",
    "churn",
    "time_to_churn"
]


# ==========================================
# Train Uplift Model (T-Learner Style)
# ==========================================

def train_uplift_model(df: pd.DataFrame):

    if "treatment_flag" not in df.columns:
        raise ValueError("treatment_flag missing")

    if "churn" not in df.columns:
        raise ValueError("churn column missing")

    # ---------- Split ----------
    treated = df[df["treatment_flag"] == 1].copy()
    control = df[df["treatment_flag"] == 0].copy()

    if len(treated) < 50 or len(control) < 50:
        raise ValueError("Not enough treated/control rows")

    y_t = treated["churn"].astype(int)
    y_c = control["churn"].astype(int)

    # ---------- Feature Prep ----------
    X_t = treated.drop(columns=DROP_COLS + ["treatment_flag"], errors="ignore")
    X_c = control.drop(columns=DROP_COLS + ["treatment_flag"], errors="ignore")

    # simple categorical encoding
    X_t = pd.get_dummies(X_t, drop_first=True)
    X_c = pd.get_dummies(X_c, drop_first=True)

    # ---------- Align Columns ----------
    cols = sorted(set(X_t.columns) | set(X_c.columns))

    for c in cols:
        if c not in X_t:
            X_t[c] = 0
        if c not in X_c:
            X_c[c] = 0

    X_t = X_t[cols]
    X_c = X_c[cols]

    # ---------- Models ----------
    model_t = XGBClassifier(
        n_estimators=300,
        max_depth=5,
        learning_rate=0.05,
        subsample=0.9,
        colsample_bytree=0.9,
        eval_metric="logloss",
        random_state=42
    )

    model_c = XGBClassifier(
        n_estimators=300,
        max_depth=5,
        learning_rate=0.05,
        subsample=0.9,
        colsample_bytree=0.9,
        eval_metric="logloss",
        random_state=42
    )

    model_t.fit(X_t, y_t)
    model_c.fit(X_c, y_c)

    MODEL_PATH.parent.mkdir(exist_ok=True)

    bundle = {
        "model_t": model_t,
        "model_c": model_c,
        "feature_cols": cols
    }

    joblib.dump(bundle, MODEL_PATH)

    return {
        "treated_rows": len(X_t),
        "control_rows": len(X_c),
        "features": len(cols),
        "model_path": str(MODEL_PATH)
    }


# ==========================================
# Load Model
# ==========================================

def load_uplift_model():
    if not MODEL_PATH.exists():
        raise RuntimeError("uplift model not trained yet")
    return joblib.load(MODEL_PATH)


# ==========================================
# Predict Uplift
# ==========================================

def predict_uplift(df: pd.DataFrame):

    bundle = load_uplift_model()

    model_t = bundle["model_t"]
    model_c = bundle["model_c"]
    cols = bundle["feature_cols"]

    X = df.drop(columns=DROP_COLS + ["treatment_flag"], errors="ignore")

    X = pd.get_dummies(X, drop_first=True)

    # add missing cols
    for c in cols:
        if c not in X:
            X[c] = 0

    X = X[cols]

    # ---------- Predict ----------
    p_t = model_t.predict_proba(X)[:, 1]
    p_c = model_c.predict_proba(X)[:, 1]

    uplift = p_c - p_t

    out = df.copy()
    out["p_if_treated"] = p_t
    out["p_if_control"] = p_c
    out["uplift_score"] = uplift
    out["best_action"] = np.where(uplift > 0, 1, 0)

    return out
