# uplift/evaluation.py

import numpy as np
import pandas as pd


# ----------------------------------------------------

def _prep_df(y, t, uplift):

    df = pd.DataFrame({
        "y": y,              # outcome (0/1 churn or retention)
        "t": t,              # treatment flag (1 treated, 0 control)
        "uplift": uplift     # predicted uplift score
    })

    df = df.sort_values("uplift", ascending=False).reset_index(drop=True)
    return df


# ----------------------------------------------------

def qini_curve(y, t, uplift):

    df = _prep_df(y, t, uplift)

    treated_total = (df.t == 1).sum()
    control_total = (df.t == 0).sum()

    treated_resp = 0
    control_resp = 0

    xs = []
    ys = []

    for i, r in df.iterrows():

        if r.t == 1:
            treated_resp += r.y
        else:
            control_resp += r.y

        treated_seen = (df.t[:i+1] == 1).sum()
        control_seen = (df.t[:i+1] == 0).sum()

        if control_seen == 0:
            adj_control = 0
        else:
            adj_control = control_resp * (treated_seen / control_seen)

        incremental = treated_resp - adj_control

        xs.append((i+1)/len(df))
        ys.append(incremental)

    return np.array(xs), np.array(ys)


# ----------------------------------------------------

def auuc_score(xs, ys):

    return np.trapz(ys, xs)


# ----------------------------------------------------

def qini_coefficient(xs, ys):

    random_line = ys[-1] * xs
    area_model = np.trapz(ys, xs)
    area_random = np.trapz(random_line, xs)

    return area_model - area_random


# ----------------------------------------------------

def gain_curve(y, t, uplift):

    df = _prep_df(y, t, uplift)

    gains = []
    pop = []

    treated_resp = 0
    control_resp = 0

    for i, r in df.iterrows():

        if r.t == 1:
            treated_resp += r.y
        else:
            control_resp += r.y

        gains.append(treated_resp - control_resp)
        pop.append((i+1)/len(df))

    return np.array(pop), np.array(gains)
