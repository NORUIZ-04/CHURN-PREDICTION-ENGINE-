import pandas as pd
import joblib
import os

from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, roc_auc_score

MODEL_PATH = "models/churn_model.pkl"


def train_churn_model(df):

    if "churn" not in df.columns:
        raise ValueError("churn column missing")

    y = df["churn"]
    X = df.drop(columns=["churn", "customer_id", "time_to_churn"], errors="ignore")

    cat_cols = X.select_dtypes(include="object").columns
    num_cols = X.select_dtypes(exclude="object").columns

    preprocessor = ColumnTransformer([
        ("cat", OneHotEncoder(handle_unknown="ignore"), cat_cols),
        ("num", "passthrough", num_cols)
    ])

    model = XGBClassifier(
        n_estimators=500,
        max_depth=6,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        scale_pos_weight=1.5
    )



    pipe = Pipeline([
        ("prep", preprocessor),
        ("model", model)
    ])

    X_train, X_test, y_train, y_test = train_test_split(
        X, y,
        test_size=0.2,
        stratify=y,
        random_state=42
    )

    pipe.fit(X_train, y_train)

    preds = pipe.predict(X_test)
    probs = pipe.predict_proba(X_test)[:,1]

    metrics = {
        "accuracy": float(accuracy_score(y_test, preds)),
        "roc_auc": float(roc_auc_score(y_test, probs))
    }

    joblib.dump(pipe, MODEL_PATH)

    return metrics


def load_model():
    return joblib.load(MODEL_PATH)


def predict_dataframe(df):

    model = load_model()

    X = df.drop(columns=["churn", "customer_id", "time_to_churn"], errors="ignore")

    probs = model.predict_proba(X)[:,1]

    return probs
