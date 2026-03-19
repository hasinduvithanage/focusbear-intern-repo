def calculate_discount(price, customer_type):
    if customer_type == "student":
        discount_rate = 0.10
    elif customer_type == "member":
        discount_rate = 0.15
    elif customer_type == "senior":
        discount_rate = 0.20
    else:
        discount_rate = 0

    discount = price * discount_rate
    final_price = price - discount

    print("Original price:", price)
    print("Discount:", discount)
    print("Final price:", final_price)


calculate_discount(100, "student")