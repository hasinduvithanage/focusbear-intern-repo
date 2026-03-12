# Mock code with duplication

def calculate_discount(price, customer_type):
    if customer_type == "student":
        discount = price * 0.10
        final_price = price - discount
        print("Original price:", price)
        print("Discount:", discount)
        print("Final price:", final_price)

    elif customer_type == "member":
        discount = price * 0.15
        final_price = price - discount
        print("Original price:", price)
        print("Discount:", discount)
        print("Final price:", final_price)

    elif customer_type == "senior":
        discount = price * 0.20
        final_price = price - discount
        print("Original price:", price)
        print("Discount:", discount)
        print("Final price:", final_price)


calculate_discount(100, "student")