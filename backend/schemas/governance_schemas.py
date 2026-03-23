# backend/models/governance_schemas.py

from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class GovernanceRequest(BaseModel):
    dataset_id: str
    include_history: bool = True


# ---------------- ADWIN ----------------

class ADWINFeatureResult(BaseModel):
    feature: str
    drift_detected: bool
    n_detections: int
    current_mean: float
    baseline_mean: float
    change_magnitude: float
    status: str


# ---------------- CUSUM ----------------

class CUSUMResult(BaseModel):
    cusum_alert: bool
    S_high_current: float
    S_low_current: float
    threshold_h: float
    direction: str
    days_since_last_reset: int


# ---------------- FAIRNESS ----------------

class FairnessResult(BaseModel):
    attribute_name: str
    group_0_positive_rate: float
    group_1_positive_rate: float
    demographic_parity: float
    dp_status: str
    equalized_odds: float
    eo_status: str
    overall_fairness: str
    recommendation: str


# ---------------- CONFIDENCE ----------------

class ConfidenceResult(BaseModel):
    confidence_score: float
    confidence_level: str
    confidence_color: str
    drift_score: float
    fairness_score: float
    calibration_score: float
    ECE_current: float
    recommendation: str
    history: List[float]


# ---------------- HISTORY ----------------

class ConfidenceHistoryItem(BaseModel):
    date: str
    score: float
    level: str


# ---------------- MAIN REPORT ----------------

class GovernanceReport(BaseModel):
    report_id: str
    generated_at: str
    dataset_size: int
    adwin_results: List[ADWINFeatureResult]
    cusum_result: CUSUMResult
    fairness_results: List[FairnessResult]
    confidence_result: ConfidenceResult
    overall_status: str
    active_alerts: List[str]
    recommendations: List[str]


# ---------------- LIGHTWEIGHT RESPONSES ----------------

class DriftStatusResponse(BaseModel):
    features: List[ADWINFeatureResult]