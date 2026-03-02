import numpy as np

class PolicyEvaluator:

    def __init__(self, uplift_model):
        self.model = uplift_model

    def evaluate_policy(self, df, policy_fn):

        total_gain = 0
        treated = 0

        for _, row in df.iterrows():

            t = policy_fn(row)

            if t == 0:
                continue

            row_df = row.to_frame().T

            probs, uplift = self.model.predict_all_treatments(row_df)

            u = float(uplift[t][0])

            total_gain += u
            treated += 1

        return {
            "treated": treated,
            "avg_uplift": total_gain / max(treated, 1),
            "total_gain": total_gain
        }
