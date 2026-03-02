COLUMN_MAP = {
    "monthly_usage": "spend",
    "complaints": "calls"
}

def adapt_row_df(row_df, feature_cols):

    df = row_df.copy()

    # create mapped columns if missing
    for src, dst in COLUMN_MAP.items():
        if src in df.columns and dst not in df.columns:
            df[dst] = df[src]

    # ensure all required columns exist
    for c in feature_cols:
        if c not in df.columns:
            df[c] = 0   # safe fallback (rarely used)

    return df[feature_cols]
