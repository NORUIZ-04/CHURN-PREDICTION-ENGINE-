from pydantic import BaseModel
from typing import Dict, List, Any


class DatasetSummary(BaseModel):
    total_rows: int
    total_columns: int
    numeric_features: int
    categorical_features: int
    churned: int
    active: int
    churn_rate: float


class MissingColumnStat(BaseModel):
    column: str
    missing_count: int
    missing_percent: float


class DataQualityReport(BaseModel):
    duplicates: int
    missing: List[MissingColumnStat]
    invalid_ranges: Dict[str, int]


class HistogramBin(BaseModel):
    bin_start: float
    bin_end: float
    count: int


class DistributionResponse(BaseModel):
    feature: str
    histogram: List[HistogramBin]


class SegmentCount(BaseModel):
    segment: str
    count: int


class SegmentResponse(BaseModel):
    column: str
    segments: Dict[str, int]


class DrilldownResponse(BaseModel):
    count: int
    rows: List[Dict[str, Any]]
