# uplift/uplift_dataset_builder.py

import numpy as np
import pandas as pd
from typing import Optional, Callable

from uplift.treatment_schema import TreatmentRegistry


class UpliftDatasetBuilder:
    """
    Builds uplift modeling dataset from churn dataset.

    Produces:
        X_features
        treatment_id
        outcome
    """

    def __init__(
        self,
        treatment_registry: TreatmentRegistry,
        churn_label_col: str = "churn",
        treatment_col: Optional[str] = None,
        id_col: Optional[str] = None,
    ):
        self.registry = treatment_registry
        self.churn_label_col = churn_label_col
        self.treatment_col = treatment_col
        self.id_col = id_col

    # ---------------------------------------------------

    def _validate(self, df: pd.DataFrame):
        if self.churn_label_col not in df.columns:
            raise ValueError(f"{self.churn_label_col} column missing")

        if self.treatment_col and self.treatment_col not in df.columns:
            raise ValueError(f"{self.treatment_col} column missing")

    # ---------------------------------------------------

    def _derive_outcome(self, df: pd.DataFrame) -> pd.Series:
        """
        Convert churn label → retention outcome
        churn=1 means churned → outcome=0
        """
        churn = df[self.churn_label_col].astype(int)
        return 1 - churn

    # ---------------------------------------------------

    def _synthetic_policy_assignment(
        self,
        df: pd.DataFrame,
        policy_fn: Optional[Callable[[pd.DataFrame], np.ndarray]] = None,
    ) -> np.ndarray:
        """
        Assign treatments when no treatment column exists.

        policy_fn can be:
        - random policy
        - rule policy
        - retention recommender wrapper
        """

        n = len(df)
        treatment_ids = [t.treatment_id for t in self.registry.list_all()]

        if policy_fn:
            assigned = policy_fn(df)
        else:
            # uniform random policy baseline
            assigned = np.random.choice(treatment_ids, size=n)

        return assigned.astype(int)

    # ---------------------------------------------------

    def _validate_treatments(self, t: np.ndarray):
        for tid in np.unique(t):
            if not self.registry.validate_id(int(tid)):
                raise ValueError(f"Unknown treatment_id {tid}")

    # ---------------------------------------------------

    def build(
        self,
        df: pd.DataFrame,
        feature_cols: list,
        policy_fn: Optional[Callable[[pd.DataFrame], np.ndarray]] = None,
        add_policy_score: bool = True,
    ) -> pd.DataFrame:
        """
        Main builder function.
        """

        self._validate(df)

        # ---------- Features ----------
        X = df[feature_cols].copy()

        # ---------- Outcome ----------
        outcome = self._derive_outcome(df)

        # ---------- Treatment ----------
        if self.treatment_col:
            treatment = df[self.treatment_col].astype(int).values
        else:
            treatment = self._synthetic_policy_assignment(df, policy_fn)

        self._validate_treatments(treatment)

        # ---------- Assemble ----------
        uplift_df = X.copy()
        uplift_df["treatment_id"] = treatment
        uplift_df["outcome"] = outcome.values

        if self.id_col and self.id_col in df.columns:
            uplift_df[self.id_col] = df[self.id_col].values

        # ---------- Policy score (for IPS / DR later) ----------
        if add_policy_score:
            k = len(self.registry.list_all())
            uplift_df["policy_score"] = 1.0 / k

        return uplift_df
