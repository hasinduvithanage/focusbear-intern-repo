def is_valid_order(order):
    return "customer" in order and "items" in order


def format_customer_name(name):
    return name.strip().title()


def is_valid_item(item):
    return (
        "price" in item and
        "qty" in item and
        item["qty"] > 0 and
        item["price"] >= 0
    )


def calculate_line_total(item):
    line_total = item["price"] * item["qty"]
    if item["qty"] >= 5:
        line_total *= 0.9
    return line_total


def calculate_order_subtotal(items):
    subtotal = 0
    for item in items:
        if is_valid_item(item):
            subtotal += calculate_line_total(item)
    return subtotal


def apply_order_discount(subtotal):
    if subtotal > 100:
        return subtotal * 0.9
    return subtotal


def add_tax(amount, tax_rate=0.08):
    return amount * (1 + tax_rate)


def build_report_line(customer_name, final_total):
    return f"{customer_name}: ${final_total:.2f}"


def process_orders(orders):
    total_revenue = 0
    report = []

    for order in orders:
        if not is_valid_order(order):
            print("Invalid order")
            continue

        customer_name = format_customer_name(order["customer"])
        subtotal = calculate_order_subtotal(order["items"])
        discounted_total = apply_order_discount(subtotal)
        final_total = add_tax(discounted_total)

        total_revenue += final_total
        report.append(build_report_line(customer_name, final_total))

    print("Order Report")
    for line in report:
        print(line)
    print(f"Total Revenue: ${total_revenue:.2f}")