def process_orders(orders):
    total_revenue = 0
    report = []

    for order in orders:
        if "customer" not in order or "items" not in order:
            print("Invalid order")
            continue

        customer_name = order["customer"].strip().title()

        order_total = 0
        for item in order["items"]:
            if "price" not in item or "qty" not in item:
                continue
            if item["qty"] <= 0 or item["price"] < 0:
                continue

            line_total = item["price"] * item["qty"]

            if item["qty"] >= 5:
                line_total *= 0.9

            order_total += line_total

        if order_total > 100:
            discount = order_total * 0.1
            order_total -= discount

        tax = order_total * 0.08
        final_total = order_total + tax
        total_revenue += final_total

        report_line = f"{customer_name}: ${final_total:.2f}"
        report.append(report_line)

    print("Order Report")
    for line in report:
        print(line)

    print(f"Total Revenue: ${total_revenue:.2f}")