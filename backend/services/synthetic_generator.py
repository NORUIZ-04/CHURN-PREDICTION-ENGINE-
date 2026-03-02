import numpy as np
import pandas as pd


def generate_synthetic_customers(n=5000, seed=42):

    np.random.seed(seed)

    df = pd.DataFrame()

    # -------------------
    # Static
    # -------------------

    df["customer_id"] = np.arange(n)
    df["age"] = np.random.randint(18, 75, n)
    df["tenure"] = np.random.randint(1, 72, n)

    df["plan_type"] = np.random.choice(
        ["basic", "plus", "premium"],
        n,
        p=[0.4, 0.4, 0.2]
    )

    # -------------------
    # Behavior
    # -------------------

    df["monthly_usage"] = np.random.normal(50, 15, n).clip(5, 120)
    df["engagement_score"] = np.random.beta(2, 2, n)
    df["complaints"] = np.random.poisson(1.2, n)
    df["payment_delay"] = np.random.exponential(3, n)

    # volatility = entropy proxy
    df["usage_volatility"] = np.random.uniform(0, 1, n)

    # shock flag (z-test style anomaly proxy)
    df["shock_flag"] = np.random.binomial(1, 0.15, n)

    # -------------------
    # Treatment (for uplift)
    # -------------------

    df["treatment_flag"] = np.random.binomial(1, 0.4, n)
    df["discount_percent"] = np.where(
        df["treatment_flag"] == 1,
        np.random.choice([10, 20, 30], n),
        0
    )

    # -------------------
    # Business
    # -------------------

    df["CLV"] = (
        df["tenure"] * df["monthly_usage"] * 2
        + np.random.normal(0, 50, n)
    ).clip(100, 10000)

    df["retention_cost"] = np.random.uniform(20, 150, n)

    # -------------------
    # True churn logic (hidden function)
    # -------------------

    risk = (
    0.5 * df["usage_volatility"]
    + 0.4 * (df["complaints"] > 2)
    + 0.35 * (df["payment_delay"] > 5)
    + 0.3 * (df["engagement_score"] < 0.3)
    + 0.25 * df["shock_flag"]
    )


    # treatment reduces risk
    risk = risk - 0.15 * df["treatment_flag"]

    prob = 1 / (1 + np.exp(-4 * (risk - 0.5)))

    df["churn"] = np.random.binomial(1, prob)

    # -------------------
    # time to churn (for survival model)
    # -------------------

    base_time = np.random.exponential(12, n)
    df["time_to_churn"] = np.where(
        df["churn"] == 1,
        base_time,
        base_time + np.random.uniform(12, 36, n)
    )

    return df
