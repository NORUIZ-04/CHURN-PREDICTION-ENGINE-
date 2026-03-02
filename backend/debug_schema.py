import pandas as pd
from counterfactual.model_store import load_uplift_bundle

df = pd.read_csv("data/processed/processed_synthetic_6000.csv")

model = load_uplift_bundle()

print("\n=== DATASET COLUMNS ===")
print(df.columns.tolist())

print("\n=== MODEL FEATURE COLS ===")
print(model.feature_cols)
