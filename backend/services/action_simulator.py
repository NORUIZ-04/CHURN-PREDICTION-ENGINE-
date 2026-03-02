import pandas as pd
from services.predictor import predict_dataframe


def simulate_actions(row: dict, actions: dict):

    base_df = pd.DataFrame([row])
    base_pred = predict_dataframe(base_df)

    base_prob = float(base_pred["churn_probability"][0])

    sim_row = row.copy()
    sim_row.update(actions)

    sim_df = pd.DataFrame([sim_row])
    sim_pred = predict_dataframe(sim_df)

    new_prob = float(sim_pred["churn_probability"][0])

    return {
        "base_probability": base_prob,
        "new_probability": new_prob,
        "delta": base_prob - new_prob
    }
