import pandas as pd


GROUP_COLS_DEFAULT = [
    "plan_type"
]


def add_age_group(df):

    if "age" not in df.columns:
        return df

    bins = [0, 30, 50, 70, 120]
    labels = ["young", "mid", "senior", "elder"]

    df["age_group"] = pd.cut(
        df["age"],
        bins=bins,
        labels=labels
    )

    return df


def fairness_table(df, group_col):

    g = df.groupby(group_col)

    table = g.agg(
        count=("customer_id", "count"),
        avg_risk=("risk", "mean"),
        churn_rate=("risk", lambda x: (x > 0.5).mean()),
        recommend_rate=("recommend", "mean"),
        avg_roi=("roi", "mean")
    ).reset_index()

    return table


def fairness_gaps(table):

    gaps = {}

    for col in ["avg_risk", "recommend_rate", "avg_roi"]:

        gaps[col + "_gap"] = (
            table[col].max() - table[col].min()
        )

    return gaps


def run_fairness_audit(
    decisions_df: pd.DataFrame,
    raw_df: pd.DataFrame
):

    df = decisions_df.merge(
        raw_df[["customer_id", "plan_type", "age"]],
        on="customer_id",
        how="left"
    )

    df = add_age_group(df)

    reports = {}

    for col in ["plan_type", "age_group"]:

        if col not in df.columns:
            continue

        table = fairness_table(df, col)

        reports[col] = {
            "table": table.to_dict(orient="records"),
            "gaps": fairness_gaps(table)
        }

    return reports
