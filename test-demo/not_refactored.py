
def calculate_monthly_payment(principal, annual_rate, months):
    monthly_rate = annual_rate / 100 / 12
    payment = (principal * monthly_rate) / (1 - (1 + monthly_rate) ** -months)
    return round(payment, 2)


# Example usage
print(calculate_monthly_payment(10000, 5, 24))   
print(calculate_monthly_payment(10000, 5, 0))    
print(calculate_monthly_payment(-5000, 5, 24))   
print(calculate_monthly_payment(10000, 0, 24))   