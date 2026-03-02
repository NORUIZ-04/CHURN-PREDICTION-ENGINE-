import os
import joblib


def load_uplift_bundle():

    required = [
        "models/uplift_tlearner.pkl",
        "models/preprocess_pipeline.pkl",
        "models/feature_cols.pkl"
    ]

    for f in required:
        if not os.path.exists(f):
            raise RuntimeError(
                f"Missing uplift model bundle file: {f}. "
                f"Run: python scripts/train_uplift_model.py"
            )

    uplift_model = joblib.load(required[0])
    preprocess = joblib.load(required[1])
    feature_cols = joblib.load(required[2])

    from counterfactual.outcome_model import OutcomeModel

    return OutcomeModel(
        uplift_model,
        preprocess,
        feature_cols
    )
