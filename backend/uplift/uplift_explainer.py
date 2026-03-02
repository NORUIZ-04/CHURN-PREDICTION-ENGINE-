# uplift/uplift_explainer.py

import shap
import numpy as np
import pandas as pd

from counterfactual.model_store import load_uplift_bundle
from uplift.treatment_schema import build_default_treatment_registry


class UpliftExplainer:

    def __init__(self):
        self.bundle = load_uplift_bundle()
        self.registry = build_default_treatment_registry()
        self.explainers = {}

    # -----------------------------------------------------

    def _get_explainer(self, treatment_id):
        if treatment_id in self.explainers:
            return self.explainers[treatment_id]

        # Get the specific model for this treatment
        tlearner = self.bundle.model
        
        # Handle different TLearner implementations
        if hasattr(tlearner, "models_"):
             model = tlearner.models_[treatment_id]
        else:
             model = tlearner.models[treatment_id]

        # Initialize TreeExplainer
        # check_additivity=False is safer for some Random Forest versions
        explainer = shap.TreeExplainer(model)
        self.explainers[treatment_id] = explainer

        return explainer

    # -----------------------------------------------------

    def explain_row(self, row_df, treatment_id):
        # 1. Prepare Data
        if hasattr(self.bundle, 'feature_cols'):
            cols = self.bundle.feature_cols
        else:
            cols = ["tenure", "spend", "calls"] 

        # Filter input to only model features
        X = row_df[cols]

        # 2. Preprocess
        if hasattr(self.bundle, 'preprocess') and self.bundle.preprocess:
            Xp = self.bundle.preprocess.transform(X)
        else:
            Xp = X

        # 3. Calculate SHAP values
        explainer = self._get_explainer(treatment_id)
        shap_vals = explainer.shap_values(Xp)

        # 4. FIX: Robust Flattening
        # TreeExplainer for binary classification returns list [Class0, Class1]
        if isinstance(shap_vals, list):
            vals = shap_vals[1]  # We want Class 1 (Churn/Retention)
        else:
            vals = shap_vals

        # Force flatten to 1D array. 
        # This handles (1, N), (N, 1), (1, N, 1) and any other variation safely.
        vals = np.array(vals).flatten()

        # 5. Zip and Sort
        pairs = []
        for i, col in enumerate(cols):
            # Ensure we don't go out of bounds if shapes mismatch
            if i < len(vals):
                val = float(vals[i]) # This is now guaranteed to work
                pairs.append((col, val))
        
        # Sort by absolute impact (magnitude)
        pairs.sort(key=lambda x: abs(x[1]), reverse=True)

        return pairs

    # -----------------------------------------------------

    def explain_uplift(self, row_df, treatment_id):
        """
        Compares drivers for Treatment X vs Control (Treatment 0).
        """
        
        # Get drivers for the requested treatment
        treat_drivers = self.explain_row(row_df, treatment_id)
        
        # Get drivers for Control (Baseline)
        control_drivers = self.explain_row(row_df, 0)

        # Convert control drivers to dict for easy lookup
        cdict = dict(control_drivers)
        
        delta = []

        # Calculate the difference (Uplift Drivers)
        for f, v in treat_drivers:
            # How much more did this feature matter in Treatment vs Control?
            control_val = cdict.get(f, 0.0)
            diff = v - control_val
            delta.append((f, diff))

        # Sort delta by magnitude
        delta.sort(key=lambda x: abs(x[1]), reverse=True)

        return {
            "treatment": treat_drivers,
            "control": control_drivers,
            "uplift_delta": delta
        }