# optimizer/roi_calculator.py

def compute_action_gain(uplift, customer_value, action_cost):
    """
    FIXED VERSION
    """

    # scale uplift from probability (0–1) to percentage points
    uplift_scaled = uplift * 100

    gain = uplift_scaled * customer_value - action_cost

    return gain