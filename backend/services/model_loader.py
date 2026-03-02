import joblib
from pathlib import Path

MODEL_PATH = Path("models/churn_model_colab.pkl")

_model = None


def get_model():
    global _model

    if _model is None:
        if not MODEL_PATH.exists():
            raise FileNotFoundError(
                f"Model not found at {MODEL_PATH}"
            )

        _model = joblib.load(MODEL_PATH)

    return _model

def get_uplift_model():
    import joblib
    return joblib.load("models/uplift_tlearner.pkl")
