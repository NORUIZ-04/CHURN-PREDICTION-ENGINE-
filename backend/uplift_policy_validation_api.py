from fastapi import APIRouter, HTTPException
import pandas as pd
import random
from pathlib import Path

# 🔧 adjust if your path constant already exists
PROCESSED_DATA_DIR = Path("processed_data")

# 🔧 uses your existing uplift bundle loader
from counterfactual.model_store import load_uplift_bundle


router = APIRouter(
    prefix="/uplift/experiment",
    tags=["uplift-validation"]
)

# =====================================================
# Policy Evaluator
# =====================================================

class PolicyEvaluator:

    def __init__(self, uplift_model):
        self.model = uplift_model

    def evaluate_policy(self, df, policy_fn):

        total_uplift = 0.0
        treated = 0

        for _, row in df.iterrows():

            t = int(policy_fn(row))

            if t == 0:
                continue

            row_df = pd.DataFrame([row])

            # ✅ select only model features
            if hasattr(self.model, "feature_cols"):
                row_df = row_df[self.model.feature_cols]
            _, uplift = self.model.predict_all_treatments(row_df)

            if t not in uplift:
                continue

            u = float(uplift[t][0])

            total_uplift += u
            treated += 1

        return {
            "treated": treated,
            "avg_uplift": total_uplift / max(treated, 1),
            "total_uplift": total_uplift
        }


# =====================================================
# Policies
# =====================================================

def best_uplift_policy_factory(model):

    def policy(row):

        row_df = pd.DataFrame([row])
        _, uplift = model.predict_all_treatments(row_df)

        best_t = 0
        best_u = -1e9

        for t, v in uplift.items():
            val = float(v[0])
            if val > best_u:
                best_u = val
                best_t = int(t)

        return best_t

    return policy


def random_policy_factory(model):

    treatment_ids = list(model.treatment_ids)

    def policy(row):
        return int(random.choice(treatment_ids))

    return policy


# =====================================================
# API Endpoint
# =====================================================

@router.post("/policy-compare/{filename}")
def compare_policies(filename: str):

    try:

        path = PROCESSED_DATA_DIR / filename

        if not path.exists():
            raise HTTPException(404, "dataset file not found")

        df = pd.read_csv(path)

        # optional — sample for speed
        if len(df) > 2000:
            df = df.sample(2000, random_state=42)

        model = load_uplift_bundle()

        evaluator = PolicyEvaluator(model)

        best_policy = best_uplift_policy_factory(model)
        rand_policy = random_policy_factory(model)

        best_result = evaluator.evaluate_policy(df, best_policy)
        rand_result = evaluator.evaluate_policy(df, rand_policy)

        return {
            "status": "ok",
            "rows_evaluated": len(df),
            "best_uplift_policy": best_result,
            "random_policy": rand_result
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        return {
            "status": "error",
            "message": str(e)
        }
