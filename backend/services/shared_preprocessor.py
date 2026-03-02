import joblib
import pandas as pd

from pathlib import Path
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder

PREP_PATH = Path("models/shared_prep.pkl")

DROP_COLS = [
    "customer_id",
    "churn",
    "time_to_churn"
]


def build_preprocessor(df: pd.DataFrame):

    X = df.drop(columns=DROP_COLS, errors="ignore")

    cat_cols = X.select_dtypes(include="object").columns
    num_cols = X.select_dtypes(exclude="object").columns

    prep = ColumnTransformer([
        ("cat", OneHotEncoder(
            handle_unknown="ignore",
            sparse_output=False
        ), cat_cols),
        ("num", "passthrough", num_cols)
    ])

    prep.fit(X)

    joblib.dump(prep, PREP_PATH)

    return prep


def load_preprocessor():

    if not PREP_PATH.exists():
        raise FileNotFoundError(
            "shared preprocessor not trained"
        )

    return joblib.load(PREP_PATH)


def transform_df(df: pd.DataFrame):

    prep = load_preprocessor()

    X = df.drop(columns=DROP_COLS, errors="ignore")

    X_trans = prep.transform(X)

    cols = prep.get_feature_names_out()

    return pd.DataFrame(X_trans, columns=cols)
