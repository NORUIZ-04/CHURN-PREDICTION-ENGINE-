import pandas as pd
from storage.results_store import store_scoring_results
from scoring.churn_scoring import score_churn
from scoring.ttc_scoring import predict_ttc
from scoring.uplift_scoring import compute_uplift
from scoring.insights_engine import generate_insights


def run_scoring_pipeline(dataset_path: str):
    df = pd.read_parquet(dataset_path)

    df = score_churn(df)
    df = predict_ttc(df)
    df = compute_uplift(df)

    insights = generate_insights(df)

    results = {
        "dataset_path": dataset_path,
        "insights": insights
    }

    store_scoring_results(results)

    return results