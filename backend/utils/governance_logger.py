# backend/utils/governance_logger.py

import json
from pathlib import Path
from datetime import datetime


LOG_DIR = Path("governance_logs")
LOG_DIR.mkdir(exist_ok=True)


class GovernanceLogger:

    def save_report(self, report: dict, dataset_id: str):

        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        path = LOG_DIR / f"{dataset_id}_{timestamp}.json"

        with open(path, "w") as f:
            json.dump(report, f, indent=2)

        return path

    # --------------------------------------------------

    def load_latest_report(self, dataset_id: str):

        files = list(LOG_DIR.glob(f"{dataset_id}_*.json"))

        if not files:
            return None

        latest = sorted(files)[-1]

        with open(latest) as f:
            return json.load(f)

    # --------------------------------------------------

    def load_history(self, dataset_id: str, n_days=30):

        files = sorted(LOG_DIR.glob(f"{dataset_id}_*.json"))[-n_days:]

        history = []

        for f in files:
            with open(f) as file:
                history.append(json.load(file))

        return history

    # --------------------------------------------------

    def get_confidence_history(self, dataset_id: str, n_days=30):

        history = self.load_history(dataset_id, n_days)

        result = []

        for h in history:
            result.append({
                "date": h["generated_at"][:10],
                "score": h["confidence_result"]["confidence_score"],
                "level": h["confidence_result"]["confidence_level"]
            })

        return result