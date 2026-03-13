# ============================================================
# BAD: Poorly commented code
# ============================================================

# function
def process(items, n):
    # loop
    result = []
    for item in items:
        # math
        val = item * n
        # check
        if val > 100:
            result.append(val)  # add
    return result  # return


# do the thing
inventory = [5, 20, 3, 15, 8]
processed = process(inventory, 7)


# ============================================================
# GOOD: Meaningful, well-placed comments
# ============================================================

def get_high_value_totals(stock_quantities, unit_price):
    """Return total values for items whose total value exceeds $100."""
    high_value_items = []

    for quantity in stock_quantities:
        total_value = quantity * unit_price

        # Only include items with significant stock value
        if total_value > 100:
            high_value_items.append(total_value)

    return high_value_items


# Unit price is $7 per item
inventory = [5, 20, 3, 15, 8]
high_value_items = get_high_value_totals(inventory, unit_price=7)