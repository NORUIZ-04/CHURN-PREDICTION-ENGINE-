def gain_curve(df, uplift_col, outcome_col):

    df = df.sort_values(uplift_col, ascending=False)

    gains = []
    running = 0

    for y in df[outcome_col]:
        running += y
        gains.append(running)

    return gains
