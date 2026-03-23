# backend/services/governance.py

import numpy as np
import pandas as pd
from river.drift import ADWIN
from datetime import datetime
import uuid
from sklearn.calibration import calibration_curve


class GovernanceService:

    def __init__(self):
        self.features = [
            "monthly_charges", "tenure", "support_calls", "usage_volatility",
            "SPI_score", "total_charges", "contract_risk_score",
            "payment_failure_flag", "CLV", "churn_probability"
        ]

        # One ADWIN per feature
        self.adwins = {f: ADWIN(delta=0.002) for f in self.features}
        self.baselines = {}

    # --------------------------------------------------
    # ADWIN DRIFT
    # --------------------------------------------------
    def detect_drift(self, df: pd.DataFrame):

        results = []

        for f in self.features:

            if f not in df.columns:
                continue

            values = df[f].dropna().values

            if f not in self.baselines:
                self.baselines[f] = np.mean(values)

            adwin = self.adwins[f]
            detections = 0

            for v in values:
                adwin.update(v)
                if adwin.drift_detected:
                    detections += 1

            current_mean = np.mean(values)
            baseline_mean = self.baselines[f]
            change = abs(current_mean - baseline_mean)
            std = np.std(values)

            if detections > 0:
                status = "DRIFT"
            elif change > 0.5 * std:
                status = "WARNING"
            else:
                status = "STABLE"

            results.append({
                "feature": f,
                "drift_detected": detections > 0,
                "n_detections": detections,
                "current_mean": float(current_mean),
                "baseline_mean": float(baseline_mean),
                "change_magnitude": float(change),
                "status": status
            })

        return results

    # --------------------------------------------------
    # CUSUM
    # --------------------------------------------------
    def cusum_monitor(self, y_pred):

        y_pred = np.array(y_pred)
        mu = np.mean(y_pred)
        sigma = np.std(y_pred)

        k = 0.5 * sigma
        h = 4.0 * sigma

        S_high = 0
        S_low = 0
        alert = False
        direction = "STABLE"

        for x in y_pred:
            S_high = max(0, S_high + (x - mu - k))
            S_low = max(0, S_low - (x - mu + k))

            if S_high > h:
                alert = True
                direction = "UPWARD"
            elif S_low > h:
                alert = True
                direction = "DOWNWARD"

        return {
            "cusum_alert": alert,
            "S_high_current": float(S_high),
            "S_low_current": float(S_low),
            "threshold_h": float(h),
            "direction": direction,
            "days_since_last_reset": len(y_pred)
        }

    # --------------------------------------------------
    # FAIRNESS
    # --------------------------------------------------
    def fairness(self, df, y_true, y_pred):

        attributes = ["SeniorCitizen", "gender", "Partner"]
        results = []

        y_pred_bin = (y_pred > 0.5).astype(int)

        for attr in attributes:

            if attr not in df.columns:
                continue

            g0 = df[attr] == df[attr].unique()[0]
            g1 = ~g0

            p0 = y_pred_bin[g0].mean()
            p1 = y_pred_bin[g1].mean()

            dp = abs(p0 - p1)

            def rates(mask):
                yt = y_true[mask]
                yp = y_pred_bin[mask]
                tpr = ((yp == 1) & (yt == 1)).sum() / max((yt == 1).sum(), 1)
                fpr = ((yp == 1) & (yt == 0)).sum() / max((yt == 0).sum(), 1)
                return tpr, fpr

            tpr0, fpr0 = rates(g0)
            tpr1, fpr1 = rates(g1)

            eo = abs(tpr0 - tpr1) + abs(fpr0 - fpr1)

            dp_status = "PASS" if dp < 0.10 else "FAIL"
            eo_status = "PASS" if eo < 0.15 else "FAIL"

            overall = "COMPLIANT" if dp_status == "PASS" and eo_status == "PASS" else "VIOLATION"

            results.append({
                "attribute_name": attr,
                "group_0_positive_rate": float(p0),
                "group_1_positive_rate": float(p1),
                "demographic_parity": float(dp),
                "dp_status": dp_status,
                "equalized_odds": float(eo),
                "eo_status": eo_status,
                "overall_fairness": overall,
                "recommendation": "Rebalance dataset or apply fairness constraints" if overall == "VIOLATION" else "No action needed"
            })

        return results

    # --------------------------------------------------
    # CALIBRATION
    # --------------------------------------------------
    def calibration_score(self, y_true, y_pred):

        prob_true, prob_pred = calibration_curve(y_true, y_pred, n_bins=10)

        ece = np.mean(np.abs(prob_true - prob_pred))
        return float(ece)

    # --------------------------------------------------
    # CONFIDENCE
    # --------------------------------------------------
    def confidence(self, drift_results, fairness_results, ece):

        drifted = sum(1 for r in drift_results if r["status"] == "DRIFT")
        drift_score = 1 - drifted / 10

        fair_pass = sum(1 for f in fairness_results if f["overall_fairness"] == "COMPLIANT")
        fairness_score = fair_pass / max(len(fairness_results), 1)

        calibration_score = 1 - min(ece / 0.10, 1.0)

        C = 0.40 * drift_score + 0.35 * fairness_score + 0.25 * calibration_score

        if C >= 0.8:
            level = "HIGH"
            color = "green"
        elif C >= 0.6:
            level = "MEDIUM"
            color = "amber"
        else:
            level = "LOW"
            color = "red"

        return {
            "confidence_score": float(C),
            "confidence_level": level,
            "confidence_color": color,
            "drift_score": drift_score,
            "fairness_score": fairness_score,
            "calibration_score": calibration_score,
            "ECE_current": float(ece),
            "recommendation": "Retrain model" if level != "HIGH" else "System stable",
            "history": []
        }

    # --------------------------------------------------
    # MAIN REPORT
    # --------------------------------------------------
    def generate_report(self, df, y_true, y_pred):

        drift = self.detect_drift(df)
        cusum = self.cusum_monitor(y_pred)
        fairness = self.fairness(df, y_true, y_pred)
        ece = self.calibration_score(y_true, y_pred)
        confidence = self.confidence(drift, fairness, ece)

        drift_count = sum(1 for d in drift if d["status"] == "DRIFT")
        fairness_fail = sum(1 for f in fairness if f["overall_fairness"] == "VIOLATION")

        if drift_count == 0 and fairness_fail == 0 and confidence["confidence_score"] >= 0.8:
            status = "HEALTHY"
        elif drift_count >= 4 or fairness_fail >= 2 or confidence["confidence_score"] < 0.6:
            status = "CRITICAL"
        else:
            status = "WARNING"

        return {
            "report_id": str(uuid.uuid4()),
            "generated_at": datetime.utcnow().isoformat(),
            "dataset_size": len(df),
            "adwin_results": drift,
            "cusum_result": cusum,
            "fairness_results": fairness,
            "confidence_result": confidence,
            "overall_status": status,
            "active_alerts": [],
            "recommendations": []
        }