# code_smells.py
# Demonstrates 7 code smells — each shown BAD then GOOD
# Context: Robot arm sensor data processing (Focus Bear internship project)

# =============================================================================
# 1. MAGIC NUMBERS & STRINGS
# =============================================================================

# --- BAD ---
def is_overheating_bad(temperature):
    return temperature > 85  # What is 85? Why 85?

def get_status_bad(code):
    if code == 3:             # What does 3 mean?
        return "shutdown"

# --- GOOD ---
MAX_JOINT_TEMPERATURE = 85   # degrees Celsius — safe operating limit
STATUS_SHUTDOWN = 3

def is_overheating(temperature):
    return temperature > MAX_JOINT_TEMPERATURE

def get_status(code):
    if code == STATUS_SHUTDOWN:
        return "shutdown"


# =============================================================================
# 2. LONG FUNCTIONS
# =============================================================================

# --- BAD ---
def process_session_bad(readings):
    # validate
    if not readings or not isinstance(readings, list):
        return None

    # filter out bad readings
    clean = []
    for r in readings:
        if r.get('temperature') is not None and r.get('joint_id') is not None:
            clean.append(r)

    # calculate average temperature
    total = 0
    for r in clean:
        total += r['temperature']
    avg = total / len(clean) if clean else 0

    # flag overheating joints
    alerts = []
    for r in clean:
        if r['temperature'] > 85:
            alerts.append(r['joint_id'])

    # build report
    report = {
        'total_readings': len(clean),
        'average_temperature': round(avg, 2),
        'overheating_joints': list(set(alerts))
    }
    return report

# --- GOOD ---
def validate_readings(readings):
    return readings and isinstance(readings, list)

def filter_valid_readings(readings):
    return [r for r in readings if r.get('temperature') is not None and r.get('joint_id') is not None]

def calculate_average(readings):
    if not readings:
        return 0
    return round(sum(r['temperature'] for r in readings) / len(readings), 2)

def find_overheating_joints(readings):
    return list({r['joint_id'] for r in readings if r['temperature'] > MAX_JOINT_TEMPERATURE})

def process_session(readings):
    if not validate_readings(readings):
        return None
    clean = filter_valid_readings(readings)
    return {
        'total_readings': len(clean),
        'average_temperature': calculate_average(clean),
        'overheating_joints': find_overheating_joints(clean)
    }


# =============================================================================
# 3. DUPLICATE CODE
# =============================================================================

# --- BAD ---
def get_joint1_average_bad(readings):
    joint_readings = [r for r in readings if r['joint_id'] == 'J1' and r['temperature'] is not None]
    if not joint_readings:
        return 0
    return sum(r['temperature'] for r in joint_readings) / len(joint_readings)

def get_joint2_average_bad(readings):
    joint_readings = [r for r in readings if r['joint_id'] == 'J2' and r['temperature'] is not None]
    if not joint_readings:
        return 0
    return sum(r['temperature'] for r in joint_readings) / len(joint_readings)

# --- GOOD ---
def get_joint_average(readings, joint_id):
    joint_readings = [r for r in readings if r['joint_id'] == joint_id and r['temperature'] is not None]
    if not joint_readings:
        return 0
    return sum(r['temperature'] for r in joint_readings) / len(joint_readings)


# =============================================================================
# 4. LARGE CLASSES (GOD OBJECTS)
# =============================================================================

# --- BAD ---
class RobotArmBad:
    def __init__(self):
        self.readings = []
        self.log = []
        self.db_connection = None
        self.alert_emails = []

    def read_sensor(self, joint_id):
        pass  # reads from hardware

    def validate_reading(self, reading):
        pass  # data validation

    def save_to_database(self, reading):
        pass  # database logic

    def send_email_alert(self, joint_id):
        pass  # email logic

    def generate_pdf_report(self):
        pass  # report generation

    def calculate_average(self, joint_id):
        pass  # analytics

    def calibrate_joint(self, joint_id):
        pass  # hardware calibration

# --- GOOD: split into focused classes ---
class SensorReader:
    """Only responsible for reading hardware sensor data."""
    def read(self, joint_id):
        pass

class SensorValidator:
    """Only responsible for validating a reading."""
    def is_valid(self, reading):
        return reading.get('temperature') is not None and reading.get('joint_id') is not None

class AlertService:
    """Only responsible for sending alerts."""
    def send_overheating_alert(self, joint_id):
        pass

class SensorAnalytics:
    """Only responsible for calculations and reporting."""
    def calculate_average(self, readings, joint_id):
        return get_joint_average(readings, joint_id)


# =============================================================================
# 5. DEEPLY NESTED CONDITIONALS
# =============================================================================

# --- BAD ---
def classify_reading_bad(reading):
    if reading is not None:
        if reading.get('temperature') is not None:
            if reading['temperature'] > 0:
                if reading['temperature'] > MAX_JOINT_TEMPERATURE:
                    return "critical"
                else:
                    if reading['temperature'] > 70:
                        return "warning"
                    else:
                        return "normal"
            else:
                return "invalid"
        else:
            return "missing"
    else:
        return "no data"

# --- GOOD: use guard clauses to exit early, flatten the logic ---
def classify_reading(reading):
    if reading is None:
        return "no data"
    if reading.get('temperature') is None:
        return "missing"
    if reading['temperature'] <= 0:
        return "invalid"
    if reading['temperature'] > MAX_JOINT_TEMPERATURE:
        return "critical"
    if reading['temperature'] > 70:
        return "warning"
    return "normal"


# =============================================================================
# 6. COMMENTED-OUT CODE
# =============================================================================

# --- BAD ---
def get_session_summary_bad(readings):
    # old approach — removed but left in "just in case"
    # total = 0
    # count = 0
    # for r in readings:
    #     total += r['temperature']
    #     count += 1
    # avg = total / count

    # tried this too but it broke on empty lists
    # avg = sum(r['temperature'] for r in readings) / len(readings)

    avg = calculate_average(readings)
    # print("DEBUG avg:", avg)
    return {"average": avg}

# --- GOOD: delete dead code; use version control (git) to recover old code if needed ---
def get_session_summary(readings):
    return {"average": calculate_average(readings)}


# =============================================================================
# 7. INCONSISTENT NAMING
# =============================================================================

# --- BAD ---
def CheckJoint(Temp, jID, x):   # mixed case, meaningless 'x'
    tLimit = 85
    if Temp > tLimit:
        flagged_jnt = jID
        return flagged_jnt
    return x                    # what is x supposed to be?

# --- GOOD: snake_case, descriptive names, no mystery parameters ---
def check_joint_temperature(temperature, joint_id, default=None):
    if temperature > MAX_JOINT_TEMPERATURE:
        return joint_id
    return default