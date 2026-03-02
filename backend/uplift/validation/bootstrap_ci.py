import numpy as np


def bootstrap_metric(values, n=200):

    samples = []

    for _ in range(n):
        resample = np.random.choice(values, size=len(values), replace=True)
        samples.append(np.mean(resample))

    return {
        "mean": float(np.mean(samples)),
        "ci_low": float(np.percentile(samples, 5)),
        "ci_high": float(np.percentile(samples, 95))
    }
