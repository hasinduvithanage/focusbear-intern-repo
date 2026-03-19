def calculate_score(numbers: list[int]) -> int:
    total_score = 0
    for number in numbers:
        if number % 2 == 0:
            total_score += double_even_rule(number)
        else:
            total_score += odd_rule(number)
    return total_score
def double_even_rule(number: int) -> int:
    if number > 3:
        return number * 2
    return number
def odd_rule(number: int) -> int:
    if number < 5:
        return number
    return number * 3
numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
score = calculate_score(numbers)
print(score)