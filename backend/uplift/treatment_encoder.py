# uplift/treatment_encoder.py

import numpy as np
from sklearn.base import BaseEstimator, TransformerMixin


class TreatmentEncoder(BaseEstimator, TransformerMixin):
    """
    sklearn-compatible transformer
    encodes treatment_id column.
    """

    def __init__(self, column_name="treatment_id"):
        self.column_name = column_name

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        if self.column_name not in X.columns:
            raise ValueError(f"{self.column_name} missing")

        return X[self.column_name].astype(int).values.reshape(-1, 1)

    def get_feature_names_out(self, input_features=None):
        return [self.column_name]
