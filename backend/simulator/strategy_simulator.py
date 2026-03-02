# simulator/strategy_simulator.py

import pandas as pd

from optimizer.campaign_allocator import CampaignAllocator
from optimizer.budget_optimizer import BudgetOptimizer
from uplift.treatment_schema import build_default_treatment_registry
from optimizer.roi_calculator import compute_action_gain


class StrategySimulator:

    def __init__(self):
        self.registry = build_default_treatment_registry()
        self.allocator = CampaignAllocator()
        self.optimizer = BudgetOptimizer()

    # ----------------------------------------------------

    def simulate_no_action(self, df):
        return {
            "strategy": "no_action",
            "targeted": 0,
            "cost": 0,
            "gain": 0
        }

    # ----------------------------------------------------

    def simulate_uplift_greedy(self, df, value_col, budget):

        plan, spend = self.allocator.allocate(df, value_col, budget)

        return {
            "strategy": "uplift_greedy",
            "targeted": len(plan),
            "cost": float(spend),
            "gain": float(plan.gain.sum()) if len(plan) else 0
        }

    # ----------------------------------------------------

    def simulate_uplift_knapsack(self, df, value_col, budget):

        model = self.allocator.model

        probs, uplift = model.predict_all_treatments(df)

        total_gain = 0
        total_cost = 0
        targeted = 0

        for i in range(len(df)):

            uplift_vec = {k: float(v[i]) for k, v in uplift.items()}

            chosen, spend = self.optimizer.optimize_single_customer(
                uplift_vec,
                df.iloc[i][value_col],
                budget,
                method="knapsack"
            )

            if chosen:
                targeted += 1
                total_cost += spend
                total_gain += sum(x["gain"] for x in chosen)

        return {
            "strategy": "uplift_knapsack",
            "targeted": targeted,
            "cost": float(total_cost),
            "gain": float(total_gain)
        }

    # ----------------------------------------------------

    def simulate_campaign_allocator(self, df, value_col, budget):

        plan, spend = self.allocator.allocate(df, value_col, budget)

        return {
            "strategy": "campaign_allocator",
            "targeted": len(plan),
            "cost": float(spend),
            "gain": float(plan.gain.sum()) if len(plan) else 0
        }

    # ----------------------------------------------------

    def compare(self, df, value_col, budget):

        results = []

        results.append(self.simulate_no_action(df))
        results.append(self.simulate_uplift_greedy(df, value_col, budget))
        results.append(self.simulate_uplift_knapsack(df, value_col, budget))
        results.append(self.simulate_campaign_allocator(df, value_col, budget))

        for r in results:
            r["roi"] = (r["gain"] / r["cost"]) if r["cost"] > 0 else 0

        return results
