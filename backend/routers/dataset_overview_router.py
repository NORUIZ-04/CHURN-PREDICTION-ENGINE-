from fastapi import APIRouter, Query,HTTPException
from services.dataset_overview_service import DatasetOverviewService
from schemas.dataset_overview_schema import *
import pandas as pd
router = APIRouter(prefix="/dataset", tags=["Dataset Overview"])


@router.get("/summary", response_model=DatasetSummary)
def summary(path: str):
    df = DatasetOverviewService.load_dataset(path)
    return DatasetOverviewService.dataset_summary(df)


@router.get("/quality", response_model=DataQualityReport)
def quality(path: str):
    df = DatasetOverviewService.load_dataset(path)
    return DatasetOverviewService.data_quality(df)


@router.get("/histogram", response_model=DistributionResponse)
def histogram(path: str, column: str, bins: int = 20):
    df = DatasetOverviewService.load_dataset(path)
    print("COLUMNS:", df.columns.tolist())
    return DatasetOverviewService.histogram(df, column, bins)


@router.get("/segments", response_model=SegmentResponse)
def segments(path: str, column: str):
    df = DatasetOverviewService.load_dataset(path)
    return DatasetOverviewService.segment_counts(df, column)


@router.get("/drilldown/segment", response_model=DrilldownResponse)
def drill_segment(path: str, column: str, value: str):
    df = DatasetOverviewService.load_dataset(path)
    return DatasetOverviewService.drilldown_segment(df, column, value)


@router.get("/drilldown/range", response_model=DrilldownResponse)
def drill_range(path: str, column: str, low: float, high: float):
    df = DatasetOverviewService.load_dataset(path)
    return DatasetOverviewService.drilldown_range(df, column, low, high)

@router.get("/columns")
def get_columns(path: str):
    df = DatasetOverviewService.load_dataset(path)

    numeric = df.select_dtypes(include="number").columns.tolist()
    categorical = df.select_dtypes(exclude="number").columns.tolist()

    return {
        "numeric": numeric,
        "categorical": categorical,
        "all": df.columns.tolist()
    }

@router.get("/numeric-bins")
def numeric_bins(path: str, column: str, bins: int = 5):

    df = DatasetOverviewService.load_dataset(path)

    if column not in df.columns:
        raise HTTPException(400, "Column not found")

    if not pd.api.types.is_numeric_dtype(df[column]):
        raise HTTPException(400, "Column not numeric")

    binned = pd.cut(df[column], bins=bins)

    counts = binned.value_counts().sort_index()

    out = []

    for interval, count in counts.items():
        out.append({
            "segment": str(interval),
            "count": int(count)
        })

    return {
        "column": column,
        "bins": out
    }
