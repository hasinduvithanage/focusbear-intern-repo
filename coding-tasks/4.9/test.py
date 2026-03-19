# test_loan_calculator.py
# Run with: pytest test_loan_calculator.py -v

import pytest
from loan_calculator import calculate_monthly_payment


# =============================================================================
# NORMAL CASES — expected correct output
# =============================================================================

def test_standard_loan():
    """A normal loan with interest should return the correct monthly payment."""
    result = calculate_monthly_payment(10000, 5, 24)
    assert result == 438.71

def test_zero_interest_rate():
    """A 0% loan should simply divide principal by months."""
    result = calculate_monthly_payment(12000, 0, 12)
    assert result == 1000.00





# =============================================================================
# EDGE CASES — unusual but valid inputs that should still return correct results
# =============================================================================

def test_high_interest_rate():
    result = calculate_monthly_payment(5000, 99, 12)
    assert result == 672.09  # was: assert result > 5000


# =============================================================================
# ERROR CASES — invalid inputs that should raise exceptions
# =============================================================================

def test_zero_months_raises_error():
    """Months = 0 should raise a ValueError."""
    with pytest.raises(ValueError, match="at least 1 month"):
        calculate_monthly_payment(10000, 5, 0)

def test_negative_months_raises_error():
    """Negative months should raise a ValueError."""
    with pytest.raises(ValueError, match="at least 1 month"):
        calculate_monthly_payment(10000, 5, -6)

def test_negative_principal_raises_error():
    """A negative loan amount should raise a ValueError."""
    with pytest.raises(ValueError, match="at least"):
        calculate_monthly_payment(-5000, 5, 24)

