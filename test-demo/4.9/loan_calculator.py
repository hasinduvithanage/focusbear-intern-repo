# loan_calculator.py

MAX_LOAN_AMOUNT = 1_000_000
MIN_LOAN_AMOUNT = 100

def calculate_monthly_payment(principal, annual_rate, months):
    """
    Calculate fixed monthly loan payment.

    Args:
        principal (float): Loan amount in dollars
        annual_rate (float): Annual interest rate as a percentage (e.g. 5 for 5%)
        months (int): Loan term in months

    Returns:
        float: Monthly payment rounded to 2 decimal places
    """
    if not isinstance(principal, (int, float)) or not isinstance(annual_rate, (int, float)) or not isinstance(months, int):
        raise TypeError("principal and annual_rate must be numbers, months must be an int.")
    if principal < MIN_LOAN_AMOUNT:
        raise ValueError(f"Principal must be at least ${MIN_LOAN_AMOUNT}.")
    if principal > MAX_LOAN_AMOUNT:
        raise ValueError(f"Principal cannot exceed ${MAX_LOAN_AMOUNT:,}.")
    if annual_rate < 0:
        raise ValueError("Annual rate cannot be negative.")
    if months <= 0:
        raise ValueError("Loan term must be at least 1 month.")

    if annual_rate == 0:
        return round(principal / months, 2)

    monthly_rate = annual_rate / 100 / 12
    payment = (principal * monthly_rate) / (1 - (1 + monthly_rate) ** -months)
    return round(payment, 2)