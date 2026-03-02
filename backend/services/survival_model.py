import pandas as pd
import joblib
import numpy as np
from lifelines import CoxPHFitter
from services.shared_preprocessor import transform_df

MODEL_PATH = "models/survival_model.pkl"


DROP_COLS = [
    "customer_id",
    "churn_probability",
    "churn_prediction"
]


def train_survival_model(df: pd.DataFrame):

    if "time_to_churn" not in df.columns:
        raise ValueError("time_to_churn missing")

    if "churn" not in df.columns:
        raise ValueError("churn event column missing")

    data = df.drop(columns=DROP_COLS, errors="ignore")

    # Cox model needs numeric only
    X = transform_df(df)
    data = X.copy()
    data["time_to_churn"] = df["time_to_churn"]
    data["churn"] = df["churn"]

    cph = CoxPHFitter()
    cph.fit(
        data,
        duration_col="time_to_churn",
        event_col="churn"
    )

    joblib.dump((cph, list(data.columns)), MODEL_PATH)

    return {
        "coefficients": len(cph.params_)
    }


def load_survival_model():
    return joblib.load(MODEL_PATH)


def predict_time_risk(df: pd.DataFrame):

    cph, cols = load_survival_model()

    data = df.drop(columns=DROP_COLS, errors="ignore")
    data = pd.get_dummies(data, drop_first=True)

    # align columns
    for c in cols:
        if c not in data:
            data[c] = 0

    data = data[cols]

    # median survival time estimate
    median_times = cph.predict_median(data)
    median_times = median_times.replace([np.inf], 999)

    # risk score
    partial = cph.predict_partial_hazard(data)

    out = df.copy()
    out["predicted_time_to_churn"] = median_times.values
    out["risk_score_time"] = partial.values

    return out
