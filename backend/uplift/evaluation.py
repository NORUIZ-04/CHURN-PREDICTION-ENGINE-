import numpy as np
import pandas as pd


# ----------------------------------------------------
# Prepare DataFrame
# ----------------------------------------------------

def _prep_df(y, t, uplift):
    df = pd.DataFrame({
        "y": y,          # outcome (0/1)
        "t": t,          # treatment flag (1 or 0)
        "uplift": uplift # predicted uplift
    })

    # Sort by highest uplift first
    df = df.sort_values("uplift", ascending=False).reset_index(drop=True)
    return df


# ----------------------------------------------------
# Qini Curve
# ----------------------------------------------------

def qini_curve(y, t, uplift):
    df = _prep_df(y, t, uplift)

    treated_resp = 0.0
    control_resp = 0.0

    treated_seen = 0
    control_seen = 0

    xs = []
    ys = []

    n = len(df)

    for i, r in df.iterrows():

        # Update counts
        if r.t == 1:
            treated_seen += 1
            treated_resp += r.y
        else:
            control_seen += 1
            control_resp += r.y

        # Avoid division by zero
        if control_seen == 0:
            adj_control = 0.0
        else:
            adj_control = control_resp * (treated_seen / control_seen)

        incremental = treated_resp - adj_control

        xs.append((i + 1) / n)
        ys.append(incremental)

    return np.array(xs), np.array(ys)


# ----------------------------------------------------
# Safe integration (NumPy version compatible)
# ----------------------------------------------------

def _integrate(xs, ys):
    """
    Handles both NumPy <2.0 (trapz) and >=2.0 (trapezoid)
    """
    if hasattr(np, "trapezoid"):
        return np.trapezoid(ys, xs)
    return np.trapz(ys, xs)


# ----------------------------------------------------
# AUUC Score (Area Under Uplift Curve)
# ----------------------------------------------------

def auuc_score(xs, ys):
    if len(xs) == 0 or len(ys) == 0:
        return 0.0

    return _integrate(xs, ys)


# ----------------------------------------------------
# Qini Coefficient
# ----------------------------------------------------

def qini_coefficient(xs, ys):
    if len(xs) == 0 or len(ys) == 0:
        return 0.0

    # Random baseline
    random_line = ys[-1] * xs

    area_model = _integrate(xs, ys)
    area_random = _integrate(xs, random_line)

    return area_model - area_random


# ----------------------------------------------------
# Gain Curve
# ----------------------------------------------------

def gain_curve(y, t, uplift):
    df = _prep_df(y, t, uplift)

    treated_resp = 0.0
    control_resp = 0.0

    gains = []
    pop = []

    n = len(df)

    for i, r in df.iterrows():

        if r.t == 1:
            treated_resp += r.y
        else:
            control_resp += r.y

        gains.append(treated_resp - control_resp)
        pop.append((i + 1) / n)

    return np.array(pop), np.array(gains)