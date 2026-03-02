# optimizer/knapsack_solver.py

def knapsack_allocate(items, budget):
    """
    0/1 knapsack dynamic programming
    """

    n = len(items)
    B = int(budget)

    dp = [[0]*(B+1) for _ in range(n+1)]

    for i in range(1, n+1):
        cost = int(items[i-1]["cost"])
        gain = items[i-1]["gain"]

        for b in range(B+1):
            if cost <= b:
                dp[i][b] = max(
                    dp[i-1][b],
                    dp[i-1][b-cost] + gain
                )
            else:
                dp[i][b] = dp[i-1][b]

    # backtrack
    chosen = []
    b = B

    for i in range(n, 0, -1):
        if dp[i][b] != dp[i-1][b]:
            chosen.append(items[i-1])
            b -= int(items[i-1]["cost"])

    spend = sum(i["cost"] for i in chosen)

    return chosen, spend
