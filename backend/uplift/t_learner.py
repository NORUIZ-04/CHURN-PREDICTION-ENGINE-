# uplift/t_learner.py

import numpy as np
from sklearn.base import BaseEstimator, ClassifierMixin, clone
from sklearn.linear_model import LogisticRegression


class TLearner(BaseEstimator, ClassifierMixin):
    """
    Multi-treatment T-learner uplift model.

    Trains one classifier per treatment_id.
    """

    def __init__(
        self,
        base_estimator=None,
        control_treatment=0,
        min_samples=30
    ):
        self.base_estimator = base_estimator 
        self.control_treatment = control_treatment
        self.min_samples = min_samples

        self.models_ = {}
        self.treatments_ = None

    # -----------------------------------------------------

    def fit(self, X, treatment, y):
        """
        X : array-like
        treatment : array-like int
        y : outcome (retention)
        """

        X = np.asarray(X)
        treatment = np.asarray(treatment).astype(int)
        y = np.asarray(y).astype(int)

        self.treatments_ = np.unique(treatment)

        for t in self.treatments_:
            mask = treatment == t

            if mask.sum() < self.min_samples:
                print(f"[TLearner] Skip treatment {t} — too few samples")
                continue

            model = clone(self.base_estimator)
            model.fit(X[mask], y[mask])
            self.models_[t] = model

        if self.control_treatment not in self.models_:
            raise ValueError("Control treatment model missing")

        return self

    # -----------------------------------------------------

    def _predict_prob_matrix(self, X):
        X = np.asarray(X)

        probs = {}

        for t, model in self.models_.items():
            p = model.predict_proba(X)[:, 1]
            probs[t] = p

        return probs

    # -----------------------------------------------------

    def predict_outcomes(self, X):
        """
        Counterfactual outcome prediction per treatment
        """
        return self._predict_prob_matrix(X)

    # -----------------------------------------------------

    def predict_uplift(self, X):
        """
        Uplift vs control treatment
        """

        probs = self._predict_prob_matrix(X)
        control = probs[self.control_treatment]

        uplift = {}

        for t, p in probs.items():
            uplift[t] = p - control

        return uplift

    # -----------------------------------------------------

    def predict_best_treatment(self, X):
        uplift = self.predict_uplift(X)

        treatments = list(uplift.keys())
        matrix = np.vstack([uplift[t] for t in treatments]).T

        best_idx = matrix.argmax(axis=1)
        best_t = np.array(treatments)[best_idx]

        return best_t

    # -----------------------------------------------------

    def predict(self, X):
        """
        sklearn compatibility — returns best treatment
        """
        return self.predict_best_treatment(X)
