# ============================================================
# BAD: Unclear variable names
# ============================================================

def calc(a, b, c):
    x = a * b
    y = x * (c / 100)
    z = x + y
    return z

d = [23, 45, 12, 67, 34]
t = 0
for i in d:
    t += i
r = t / len(d)


# ============================================================
# GOOD: Clear, descriptive variable names
# ============================================================

def calculate_total_price(unit_price, quantity, tax_rate_percent):
    subtotal = unit_price * quantity
    tax_amount = subtotal * (tax_rate_percent / 100)
    total_price = subtotal + tax_amount
    return total_price

student_scores = [23, 45, 12, 67, 34]
total_score = 0
for score in student_scores:
    total_score += score
average_score = total_score / len(student_scores) 