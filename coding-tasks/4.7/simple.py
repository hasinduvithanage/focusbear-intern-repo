#  GOOD VERSION (clean and readable)

def get_average_temperature_above_threshold(readings, joint_id, threshold):
    valid_readings = [
        r['temperature'] for r in readings
        if r['joint_id'] == joint_id
        and r['temperature'] is not None
        and r['temperature'] > threshold
    ]

    if not valid_readings:
        return 0

    return sum(valid_readings) / len(valid_readings)