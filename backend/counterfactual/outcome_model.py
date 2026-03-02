# counterfactual/outcome_model.py

import numpy as np
import pandas as pd


class OutcomeModel:
    """
    Counterfactual outcome predictor using TLearner.
    Wraps preprocessing + uplift model.
    """

    def __init__(self, uplift_model, preprocess_pipeline, feature_cols):
        self.model = uplift_model
        self.preprocess = preprocess_pipeline
        self.feature_cols = feature_cols

    # -----------------------------------------------------

    def _prepare_X(self, df: pd.DataFrame):
        X = df[self.feature_cols]
        Xp = self.preprocess.transform(X)
        return Xp

    # -----------------------------------------------------

    def predict_all_treatments(self, df: pd.DataFrame):
        """
        Returns outcome probability per treatment.
        """

        Xp = self._prepare_X(df)

        probs = self.model.predict_outcomes(Xp)
        uplift = self.model.predict_uplift(Xp)

        return probs, uplift

    # -----------------------------------------------------

    def predict_best_action(self, df: pd.DataFrame):
        Xp = self._prepare_X(df)
        return self.model.predict_best_treatment(Xp)
