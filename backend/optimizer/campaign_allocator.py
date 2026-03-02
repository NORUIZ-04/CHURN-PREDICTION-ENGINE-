# optimizer/campaign_allocator.py

import pandas as pd

from counterfactual.model_store import load_uplift_bundle
from optimizer.roi_calculator import compute_action_gain
from uplift.treatment_schema import build_default_treatment_registry


class CampaignAllocator:

    def __init__(self):
        self.model = load_uplift_bundle()
        self.registry = build_default_treatment_registry()

    # -----------------------------------------------------

    def score_population(self, df, customer_value_col):

        probs, uplift = self.model.predict_all_treatments(df)

        rows = []

        for i in range(len(df)):

            cust_val = df.iloc[i][customer_value_col]

            for tid, uplift_vec in uplift.items():

                t = self.registry.get(int(tid))

                gain = compute_action_gain(
                    uplift_vec[i],
                    cust_val,
                    t.cost
                )

                rows.append({
                    "row_id": int(i),
                    "treatment_id": int(tid),
                    "action": t.name,
                    "cost": t.cost,
                    "uplift": float(uplift_vec[i]),
                    "customer_value": float(cust_val),
                    "gain": float(gain)
                })

        return pd.DataFrame(rows)

    # -----------------------------------------------------

    def allocate(self, df, customer_value_col, budget):

        score_df = self.score_population(df, customer_value_col)

        # keep only positive gain actions
        score_df = score_df[score_df.gain > 0]

        # best action per customer
        best = (
            score_df
            .sort_values("gain", ascending=False)
            .groupby("row_id")
            .first()
            .reset_index()
        )

        # sort globally by gain
        best = best.sort_values("gain", ascending=False)

        chosen = []
        spend = 0

        for _, r in best.iterrows():

            if spend + r.cost > budget:
                continue

            chosen.append(r.to_dict())
            spend += r.cost

        result = pd.DataFrame(chosen)

        return result, spend
