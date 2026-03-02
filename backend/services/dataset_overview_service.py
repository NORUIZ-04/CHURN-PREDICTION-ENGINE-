from fastapi import HTTPException
import pandas as pd
import numpy as np
from typing import Dict, List
from pathlib import Path

# ⭐ DEFINE UPLOAD DIRECTORY HERE
UPLOAD_DIR = Path("uploads")
PROCESSED_DIR = Path("data/processed")
class DatasetOverviewService:
    @staticmethod
    def load_dataset(path: str):
        try:
            filename = Path(path).name  # remove folder if included

            upload_path = UPLOAD_DIR / filename
            processed_path = PROCESSED_DIR / filename

            if upload_path.exists():
                full_path = upload_path
            elif processed_path.exists():
                full_path = processed_path
            else:
                raise FileNotFoundError(
                    f"Dataset not found in uploads/ or data/processed/: {filename}"
                )

            return pd.read_csv(full_path)

        except Exception as e:
            raise RuntimeError(f"Dataset load failed: {str(e)}")


    # ---------------------------
    # PROFILING
    # ---------------------------
    @staticmethod
    def dataset_summary(df: pd.DataFrame, churn_col="churn"):
        numeric_cols = df.select_dtypes(include=np.number).columns
        categorical_cols = df.select_dtypes(exclude=np.number).columns

        churned = int(df[churn_col].sum()) if churn_col in df else 0
        active = int(len(df) - churned)

        return {
            "total_rows": len(df),
            "total_columns": df.shape[1],
            "numeric_features": len(numeric_cols),
            "categorical_features": len(categorical_cols),
            "churned": churned,
            "active": active,
            "churn_rate": round(churned / len(df), 4) if len(df) else 0
        }


    # ---------------------------
    # DATA QUALITY
    # ---------------------------
    @staticmethod
    def data_quality(df: pd.DataFrame):

        missing_stats = []
        for col in df.columns:
            m = df[col].isna().sum()
            if m > 0:
                missing_stats.append({
                    "column": col,
                    "missing_count": int(m),
                    "missing_percent": round(m / len(df) * 100, 2)
                })

        duplicates = int(df.duplicated().sum())

        invalid_ranges = {}
        for col in df.select_dtypes(include=np.number):
            invalid_ranges[col] = int((~np.isfinite(df[col])).sum())

        return {
            "duplicates": duplicates,
            "missing": missing_stats,
            "invalid_ranges": invalid_ranges
        }


    # ---------------------------
    # DISTRIBUTIONS
    # ---------------------------
    @staticmethod
    def histogram(df: pd.DataFrame, column: str, bins=20):

        if column not in df:
            raise HTTPException(
                status_code=400,
                detail=f"Column '{column}' not found"
            )

        series = df[column].dropna()
        counts, edges = np.histogram(series, bins=bins)

        output = []
        for i in range(len(counts)):
            output.append({
                "bin_start": float(edges[i]),
                "bin_end": float(edges[i+1]),
                "count": int(counts[i])
            })

        return {
            "feature": column,
            "histogram": output
        }


    # ---------------------------
    # SEGMENT COUNTS
    # ---------------------------
    @staticmethod
    def segment_counts(df, column: str):

        if column not in df.columns:
            raise ValueError("Column not found")

        counts = (
            df[column]
            .astype(str)
            .value_counts()
            .to_dict()
        )

        return {
            "column": column,
            "segments": counts
        }


    # ---------------------------
    # DRILLDOWN
    # ---------------------------
    @staticmethod
    def drilldown_segment(df: pd.DataFrame, column: str, value: str, limit=200):

        sub = df[df[column] == value].head(limit)

        return {
            "count": len(sub),
            "rows": sub.to_dict(orient="records")
        }


    @staticmethod
    def drilldown_range(df: pd.DataFrame, column: str, low: float, high: float, limit=200):

        sub = df[(df[column] >= low) & (df[column] < high)].head(limit)

        return {
            "count": len(sub),
            "rows": sub.to_dict(orient="records")
        }
