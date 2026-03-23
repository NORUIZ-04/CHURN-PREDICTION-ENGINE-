# optimizer/budget_optimizer.py

from uplift.treatment_schema import build_default_treatment_registry
from optimizer.roi_calculator import compute_action_gain
from optimizer.greedy_allocator import greedy_allocate
from optimizer.knapsack_solver import knapsack_allocate


class BudgetOptimizer:

    def __init__(self, registry=None):
        self.registry = registry or build_default_treatment_registry()

    # --------------------------------------------------

    def build_items(self, uplift_vector, customer_value):

        items = []

        for tid, uplift in uplift_vector.items():

            t = self.registry.get(int(tid))

            gain = compute_action_gain(
                uplift,
                customer_value,
                t.cost
            )

            # Skip useless actions
            if gain <= 0:
                continue

            items.append({
                "treatment_id": tid,
                "action": t.name,
                "cost": t.cost,
                "gain": gain,
                "roi": gain / t.cost if t.cost > 0 else 0
            })

        return items

    # --------------------------------------------------

    def optimize_single_customer(
        self,
        uplift_vector,
        customer_value,
        budget,
        method="greedy"
    ):

        items = self.build_items(uplift_vector, customer_value)

        if method == "knapsack":
            chosen, spend = knapsack_allocate(items, budget)
        else:
            chosen, spend = greedy_allocate(items, budget)

        return chosen, spend