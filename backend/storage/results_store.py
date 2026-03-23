import json
import os
from datetime import datetime

RESULTS_FILE = "data/scoring_results.json"


def load_results():
    if not os.path.exists(RESULTS_FILE):
        return []
    with open(RESULTS_FILE, "r") as f:
        return json.load(f)


def save_results(results):
    with open(RESULTS_FILE, "w") as f:
        json.dump(results, f, indent=2)


def store_scoring_results(results: dict):
    all_results = load_results()

    results["timestamp"] = datetime.utcnow().isoformat()

    all_results.append(results)
    save_results(all_results)

    return results