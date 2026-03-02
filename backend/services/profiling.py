import pandas as pd

def profile_dataframe(df):

    return {
        "rows": int(df.shape[0]),
        "columns": int(df.shape[1]),
        "column_names": list(df.columns),
        "missing": df.isna().sum().to_dict(),
        "dtypes": df.dtypes.astype(str).to_dict(),
        "numeric_summary": df.describe().to_dict()
    }
