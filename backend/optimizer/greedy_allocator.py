# optimizer/greedy_allocator.py

def greedy_allocate(items, budget):
    """
    items: list of dicts with keys:
        id, cost, gain, action
    """

    items = sorted(items, key=lambda x: x["gain"], reverse=True)

    chosen = []
    spend = 0

    for it in items:
        if it["gain"] <= 0:
            continue

        if spend + it["cost"] <= budget:
            chosen.append(it)
            spend += it["cost"]

    return chosen, spend
