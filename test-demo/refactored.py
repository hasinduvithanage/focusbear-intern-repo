
def calculate_monthly_payment(principal, annual_rate, months):
    if principal <= 0:
        raise ValueError("Principal must be a positive number.")
    if annual_rate < 0:
        raise ValueError("Annual rate cannot be negative.")
    if months <= 0:
        raise ValueError("Loan term must be at least 1 month.")

    if annual_rate == 0:
        return round(principal / months, 2)

    monthly_rate = annual_rate / 100 / 12
    payment = (principal * monthly_rate) / (1 - (1 + monthly_rate) ** -months)
    return round(payment, 2)


print(calculate_monthly_payment(10000, 5, 24))  
try:
    print(calculate_monthly_payment(10000, 5, 0))
except ValueError as e:
    print(f"Error: {e}")                        

try:
    print(calculate_monthly_payment(-5000, 5, 24))
except ValueError as e:
    print(f"Error: {e}")                         
print(calculate_monthly_payment(10000, 0, 24))   