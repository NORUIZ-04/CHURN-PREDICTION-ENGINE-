import pandas as pd

REQUIRED_COLS = [
    "uplift_score",
    "CLV",
    "retention_cost"
]


def validate_cols(df):
    for c in REQUIRED_COLS:
        if c not in df.columns:
            raise ValueError(f"{c} missing — run uplift first")


def compute_value_metrics(df):

    validate_cols(df)

    df = df.copy()

    df["expected_saved_value"] = (
        df["uplift_score"] * df["CLV"]
    )

    df["expected_profit"] = (
        df["expected_saved_value"] -
        df["retention_cost"]
    )

    df["roi"] = df["expected_saved_value"] / df["retention_cost"].clip(lower=1)


    return df


def optimize_budget(df, total_budget):

    df = compute_value_metrics(df)

    # only profitable customers
    df = df[df["expected_profit"] > 0]

    # rank by profit per cost (efficiency)
    df = df.sort_values(
        "roi",
        ascending=False
    )

    selected = []
    spent = 0

    for _, row in df.iterrows():

        cost = row["retention_cost"]

        if spent + cost <= total_budget:
            selected.append(row)
            spent += cost

    if not selected:
        return pd.DataFrame(), 0

    out = pd.DataFrame(selected)

    return out, spent
