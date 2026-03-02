import os
import joblib
import numpy as np
import pandas as pd

from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

from uplift.treatment_schema import build_default_treatment_registry
from uplift.uplift_dataset_builder import UpliftDatasetBuilder
from uplift.t_learner import TLearner


# -----------------------------
# Fake dataset for now
# Replace with your real processed dataset loader later
# -----------------------------

def make_dataset(n=800):
    np.random.seed(1)

    df = pd.DataFrame({
        "tenure": np.random.randint(1, 72, n),
        "spend": np.random.uniform(20, 150, n),
        "calls": np.random.randint(0, 6, n),
    })

    churn_prob = 0.45 - 0.004*df.tenure + 0.02*df.calls - 0.001*df.spend
    df["churn"] = (np.random.rand(n) < churn_prob).astype(int)

    return df


# -----------------------------
def policy(df):
    out = []
    for _, r in df.iterrows():
        if r['calls'] >= 4:
            out.append(3)   # Retention Call
        elif r['spend'] > 100:
            out.append(1)   # Discount
        elif r['spend'] > 60:
            out.append(2)   # Loyalty Bonus
        else:
            out.append(0)   # <--- CRITICAL: Control Group (No Action)
            
    return np.array(out)

# -----------------------------

print("\n=== BUILD DATA ===")

df = make_dataset()

registry = build_default_treatment_registry()
builder = UpliftDatasetBuilder(registry)

uplift_df = builder.build(
    df,
    feature_cols=["tenure", "spend", "calls"],
    policy_fn=policy
)

feature_cols = ["tenure", "spend", "calls"]

X = uplift_df[feature_cols].values
T = uplift_df["treatment_id"].values
y = uplift_df["outcome"].values

# -----------------------------
# Preprocess pipeline
# (use your real preprocessing later)
# -----------------------------

preprocess = Pipeline([
    ("scaler", StandardScaler())
])

Xp = preprocess.fit_transform(X)

# -----------------------------
# Train TLearner
# -----------------------------

print("\n=== TRAIN T-LEARNER ===")

tlearner = TLearner(
    base_estimator=RandomForestClassifier(n_estimators=150),
    control_treatment=0
)

tlearner.fit(Xp, T, y)

print("Models trained:", tlearner.models_.keys())

# -----------------------------
# Save bundle
# -----------------------------

os.makedirs("models", exist_ok=True)

joblib.dump(tlearner, "models/uplift_tlearner.pkl")
joblib.dump(preprocess, "models/preprocess_pipeline.pkl")
joblib.dump(feature_cols, "models/feature_cols.pkl")

print("\n✅ Saved model bundle to /models/")
