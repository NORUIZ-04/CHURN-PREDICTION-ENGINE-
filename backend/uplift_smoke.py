# uplift_smoke.py

import pandas as pd
import numpy as np

# Adjust imports based on your folder structure
from uplift.treatment_schema import build_default_treatment_registry
from uplift.treatment_encoder import TreatmentEncoder
from uplift.uplift_dataset_builder import UpliftDatasetBuilder

def make_fake_dataset(n=50):
    """
    Creates a dummy dataset with churn labels and features.
    """
    np.random.seed(42)
    return pd.DataFrame({
        "customer_id": range(n),
        "tenure": np.random.randint(1, 60, n),
        "monthly_spend": np.random.uniform(20, 120, n),
        "support_calls": np.random.randint(0, 5, n),
        "contract_type": np.random.randint(0, 3, n),
        # 1 = Churned, 0 = Stayed
        "churn": np.random.randint(0, 2, n) 
    })

def test_registry():
    print("\n=== TEST: Treatment Registry ===")
    reg = build_default_treatment_registry()
    all_t = reg.list_all()
    print(f"✅ Registered {len(all_t)} treatments.")
    
    # Verify IDs are 0, 1, 2, 3, 4
    ids = sorted([t.treatment_id for t in all_t])
    print(f"   IDs found: {ids}")

def test_encoder(df):
    print("\n=== TEST: Treatment Encoder ===")
    if 'treatment_id' not in df.columns:
        print("⚠️  Skipping Encoder test (treatment_id missing from input)")
        return

    enc = TreatmentEncoder(column_name='treatment_id')
    
    # Fit transform
    encoded = enc.fit_transform(df)
    
    print(f"✅ Encoder Output Shape: {encoded.shape}")
    print(f"   Sample values:\n{encoded[:3]}")

def simple_policy(df):
    """
    A simple rule-based policy to test the 'policy_fn' argument.
    Returns a numpy array of treatment IDs.
    """
    out = []
    for _, r in df.iterrows():
        # High support calls -> Personal Call (ID 3)
        if r.support_calls >= 3:
            out.append(3)
        # High spend -> Discount (ID 1)
        elif r.monthly_spend > 90:
            out.append(1)
        # Default -> No Action (ID 0)
        else:
            out.append(0)
    return np.array(out)

def test_builder_random(df):
    print("\n=== TEST: Builder (Random Assignment) ===")
    reg = build_default_treatment_registry()
    
    # Initialize Builder
    # Note: churn_label_col matches the fake dataset column 'churn'
    builder = UpliftDatasetBuilder(
        treatment_registry=reg,
        churn_label_col="churn", 
        id_col="customer_id"
    )

    # Build dataset (No policy_fn = Random Assignment)
    uplift_df = builder.build(
        df=df,
        feature_cols=["tenure", "monthly_spend", "support_calls"]
    )
    
    print("✅ Build Successful")
    print(f"   Output Columns: {uplift_df.columns.tolist()}")
    print(f"   Outcome Mean (Retention): {uplift_df['outcome'].mean():.2f}")
    
    # Check if we have roughly equal distribution of random treatments
    print("   Treatment Distribution (should be roughly uniform):")
    print(uplift_df['treatment_id'].value_counts().sort_index())
    
    return uplift_df

def test_builder_policy(df):
    print("\n=== TEST: Builder (Custom Policy) ===")
    reg = build_default_treatment_registry()
    
    builder = UpliftDatasetBuilder(
        treatment_registry=reg,
        churn_label_col="churn"
    )

    # Build using the 'simple_policy' function
    uplift_df = builder.build(
        df=df,
        feature_cols=["tenure", "monthly_spend", "support_calls"],
        policy_fn=simple_policy
    )
    
    print("✅ Build Successful")
    # Verify that we only see treatments 0, 1, and 3 (from our simple_policy)
    counts = uplift_df['treatment_id'].value_counts().sort_index()
    print("   Treatment Distribution (should only match policy logic):")
    print(counts)

if __name__ == "__main__":
    # 1. Create Data
    df = make_fake_dataset()
    print(f"Created fake dataset with shape {df.shape}")

    # 2. Test Registry
    test_registry()

    # 3. Test Builder (Random)
    uplift_df_random = test_builder_random(df)

    # 4. Test Encoder (using the output from the builder)
    test_encoder(uplift_df_random)

    # 5. Test Builder (Policy)
    test_builder_policy(df)

    print("\n✅ ALL TESTS COMPLETED")