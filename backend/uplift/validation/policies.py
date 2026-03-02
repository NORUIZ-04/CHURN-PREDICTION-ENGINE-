def top_uplift_policy(cf, threshold=0.01):

    def policy(row):
        best = 0
        best_u = 0

        for t in cf.treatment_ids:
            _, _, u = cf.predict_row(row, t)
            if u > best_u:
                best_u = u
                best = t

        return best if best_u > threshold else 0

    return policy
