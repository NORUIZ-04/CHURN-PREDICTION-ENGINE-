# optimizer/roi_calculator.py

def compute_action_gain(uplift, customer_value, action_cost):
    """
    uplift: probability improvement
    customer_value: expected retained revenue
    action_cost: intervention cost
    """

    return uplift * customer_value - action_cost
