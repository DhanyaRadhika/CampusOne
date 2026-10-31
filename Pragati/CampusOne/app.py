from flask import Flask, request, jsonify, url_for
from flask_cors import CORS
from flask_mail import Mail, Message
from itsdangerous import URLSafeTimedSerializer
from datetime import datetime
import json
import os
import re

app = Flask(__name__)
CORS(app)
mail = Mail(app)

# Email configuration (update with your SMTP settings)
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'your-email@gmail.com'  # Replace with your email
app.config['MAIL_PASSWORD'] = 'your-password'  # Replace with your password
app.config['MAIL_DEFAULT_SENDER'] = 'your-email@gmail.com'

# Secret key for token generation
app.config['SECRET_KEY'] = 'your-secret-key'  # Replace with a secure key

serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])

def send_verification_email(email, token):
    verify_url = url_for('verify_email', token=token, _external=True)
    msg = Message('Verify Your Email', recipients=[email])
    msg.body = f'Click the link to verify your email: {verify_url}'
    mail.send(msg)

@app.route('/api/verify/<token>', methods=['GET'])
def verify_email(token):
    try:
        email = serializer.loads(token, salt='email-verification', max_age=3600)  # 1 hour
        if email in users_db:
            users_db[email]['verified'] = True
            save_json(USERS_FILE, users_db)
            return jsonify({'message': 'Email verified successfully'}), 200
        else:
            return jsonify({'error': 'Invalid token'}), 400
    except Exception as e:
        return jsonify({'error': 'Verification failed', 'details': str(e)}), 400

# Email validation regex
EMAIL_REGEX = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'

def is_valid_email(email):
    return re.match(EMAIL_REGEX, email) is not None

# Persistent storage using a JSON file
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
USERS_FILE = os.path.join(DATA_DIR, "users.json")
ATTENDANCE_FILE = os.path.join(DATA_DIR, "attendance.json")
EVENTS_FILE = os.path.join(DATA_DIR, "events.json")

os.makedirs(DATA_DIR, exist_ok=True)

def load_json(path, default):
    try:
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
    except Exception:
        pass
    return default

def save_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

# Load or initialize databases
users_db = load_json(USERS_FILE, {})
attendance_db = load_json(ATTENDANCE_FILE, [])
def load_events():
    try:
        if os.path.exists(EVENTS_FILE):
            with open(EVENTS_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
    except Exception:
        pass
    return {}


events_db = load_events()

# Seed a default test user if none exist
if not users_db:
    users_db['test@example.com'] = {
        'id': 'test@example.com',
        'username': 'test@example.com',
        'password': 'password',
        'name': 'Test User',
        'email': 'test@example.com',
        'role': 'student',
        'skills': [],
        'cgpa': '3.5',
        'branch': None,
        'year': None,
        'department': None,
        'avatar': None,
        'verified': True
    }
    save_json(USERS_FILE, users_db)

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        user = users_db.get(email)
        if user and user['password'] == password:
            if not user.get('verified', False):
                return jsonify({'error': 'Please verify your email before logging in'}), 403
            # Don't send password back
            user_response = {k: v for k, v in user.items() if k != 'password'}
            return jsonify({'user': user_response}), 200
        else:
            return jsonify({'error': 'Invalid credentials'}), 401
    except Exception as e:
        return jsonify({'error': 'Login failed', 'details': str(e)}), 500

@app.route('/api/users', methods=['POST'])
def create_user():
    try:
        data = request.get_json()
        email = data.get('email', '').strip()
        
        # Validate email format
        if not email or not is_valid_email(email):
            return jsonify({'error': 'Invalid email format'}), 400
        
        if email in users_db:
            return jsonify({'error': 'User already exists'}), 400
        
        user = {
            'id': email,
            'username': email,
            'password': data.get('password'),
            'name': data.get('name'),
            'email': email,
            'role': data.get('role'),
            'branch': data.get('branch'),
            'year': data.get('year'),
            'skills': data.get('skills', []),
            'cgpa': data.get('cgpa'),
            'department': data.get('department'),
            'avatar': data.get('avatar'),
            'verified': True  # Temporarily set to True until email is configured
        }
        
        users_db[email] = user
        save_json(USERS_FILE, users_db)
        
        # TODO: Enable email verification
        # token = serializer.dumps(email, salt='email-verification')
        # send_verification_email(email, token)
        
        return jsonify({'message': 'User created successfully'}), 201
    except Exception as e:
        return jsonify({'error': 'Failed to create user', 'details': str(e)}), 400

@app.route('/api/attendance', methods=['POST'])
def insert_attendance():
    try:
        data = request.get_json()
        date_key = data.get('date', str(datetime.now().date()))
        attendance_record = {
            'id': str(len(attendance_db) + 1),
            'date': date_key,
            'studentId': data.get('studentId'),
            'studentName': data.get('studentName'),
            'rollNumber': data.get('rollNumber'),
            'className': data.get('className'),
            'section': data.get('section'),
            'present': data.get('present'),
            'facultyId': data.get('facultyId')
        }
        attendance_db.append(attendance_record)
        save_json(ATTENDANCE_FILE, attendance_db)
        return jsonify(attendance_record), 201
    except Exception as e:
        return jsonify({'error': 'Invalid attendance data', 'details': str(e)}), 400


@app.route('/api/attendance/batch', methods=['POST'])
def insert_attendance_batch():
    try:
        data = request.get_json()
        if not isinstance(data, dict):
            return jsonify({'error': 'Attendance data must be an object'}), 400

        date_key = data.get('date')
        section = data.get('section')
        students = data.get('students')
        if not isinstance(date_key, str) or not re.fullmatch(r'\d{4}-\d{2}-\d{2}', date_key):
            return jsonify({'error': 'Date must use YYYY-MM-DD format'}), 400
        try:
            datetime.strptime(date_key, '%Y-%m-%d')
        except ValueError:
            return jsonify({'error': 'Date must be a valid calendar date'}), 400
        if section not in ('A', 'B', 'C'):
            return jsonify({'error': 'Section must be A, B, or C'}), 400
        if not isinstance(students, list) or not students:
            return jsonify({'error': 'Students must be a non-empty list'}), 400

        for student in students:
            if (
                not isinstance(student, dict)
                or not student.get('studentId')
                or not isinstance(student.get('studentName'), str)
                or not isinstance(student.get('rollNumber'), str)
                or not isinstance(student.get('present'), bool)
            ):
                return jsonify({'error': 'Each student requires an ID, name, roll number, and attendance status'}), 400

        class_name = data.get('className', 'CS304 - Data Structures')
        faculty_id = data.get('facultyId', 'faculty')
        existing_records = [
            record for record in attendance_db
            if not (
                record.get('date') == date_key
                and record.get('section') == section
                and record.get('className') == class_name
            )
        ]
        next_id = max(
            (
                int(record['id'])
                for record in existing_records
                if str(record.get('id', '')).isdigit()
            ),
            default=0,
        ) + 1
        new_records = [
            {
                'id': str(next_id + index),
                'date': date_key,
                'studentId': student['studentId'],
                'studentName': student['studentName'],
                'rollNumber': student['rollNumber'],
                'className': class_name,
                'section': section,
                'present': student['present'],
                'facultyId': faculty_id,
            }
            for index, student in enumerate(students)
        ]
        updated_records = existing_records + new_records
        save_json(ATTENDANCE_FILE, updated_records)
        attendance_db[:] = updated_records
        return jsonify({'message': 'Attendance saved successfully', 'records': new_records}), 201
    except Exception as e:
        return jsonify({'error': 'Failed to save attendance', 'details': str(e)}), 500


@app.route('/api/attendance/<date>', methods=['GET'])
def get_attendance_by_date(date):
    try:
        records = [r for r in attendance_db if r.get('date') == date]
        return jsonify({'records': records}), 200
    except Exception as e:
        return jsonify({'error': 'Failed to fetch attendance', 'details': str(e)}), 500

@app.route('/api/events', methods=['POST'])
def create_event():
    try:
        data = request.get_json()
        event_id = str(len(events_db) + 1)
        event = {
            'id': event_id,
            'title': data.get('title'),
            'type': data.get('type'),  # technical, cultural, workshop, etc
            'description': data.get('description'),
            'date': data.get('date'),
            'location': data.get('location'),
            'image': data.get('image'),  # base64 or URL
            'eligibility': data.get('eligibility'),
            'registrationLink': data.get('registrationLink'),
            'organizer': data.get('organizer'),
            'registeredCount': 0,
            'maxCapacity': data.get('maxCapacity', 100),
            'createdAt': str(datetime.now())
        }
        events_db[event_id] = event
        # persist events
        save_json(EVENTS_FILE, events_db)
        return jsonify({'message': 'Event created successfully', 'event': event}), 201
    except Exception as e:
        return jsonify({'error': 'Failed to create event', 'details': str(e)}), 400

@app.route('/api/events', methods=['GET'])
def get_all_events():
    try:
        events_list = list(events_db.values())
        return jsonify({'events': events_list}), 200
    except Exception as e:
        return jsonify({'error': 'Failed to fetch events', 'details': str(e)}), 500


@app.route('/api/events/<event_id>', methods=['DELETE'])
def delete_event(event_id):
    try:
        if event_id in events_db:
            del events_db[event_id]
            save_json(EVENTS_FILE, events_db)
            return jsonify({'success': True}), 200
        return jsonify({'error': 'Event not found'}), 404
    except Exception as e:
        return jsonify({'error': 'Failed to delete event', 'details': str(e)}), 500


@app.route('/api/attendance', methods=['GET'])
def get_attendance_query():
    try:
        roll = request.args.get('roll')
        date = request.args.get('date')
        month = request.args.get('month')
        if roll:
            records = [r for r in attendance_db if r.get('rollNumber') == roll]
            if not records:
                return jsonify({'error': 'Not found'}), 404
            return jsonify({'records': records}), 200
        if date:
            records = [
                r for r in attendance_db
                if isinstance(r.get('date'), str) and r['date'].split('T')[0] == date
            ]
            return jsonify({'records': records}), 200
        if month:
            if not re.fullmatch(r'\d{4}-\d{2}', month):
                return jsonify({'error': 'Month must use YYYY-MM format'}), 400
            records = [
                r for r in attendance_db
                if isinstance(r.get('date'), str) and r['date'][:7] == month
            ]
            return jsonify({'records': records}), 200
        return jsonify({'error': 'roll, date, or month query param required'}), 400
    except Exception as e:
        return jsonify({'error': 'Failed to fetch attendance', 'details': str(e)}), 500


@app.route('/api/roster', methods=['GET'])
def get_roster():
    try:
        date = request.args.get('date')
        records = []
        if date:
            records = [r for r in attendance_db if r.get('date') == date]
        else:
            if not attendance_db:
                return jsonify({'roster': {}}), 200
            # find latest date
            dates = [r.get('date') for r in attendance_db if r.get('date')]
            latest = sorted(dates)[-1] if dates else None
            if latest:
                records = [r for r in attendance_db if r.get('date') == latest]
            if not records:
                # fallback to unique students across all attendances
                seen = set()
                records = []
                for r in attendance_db:
                    key = r.get('rollNumber')
                    if not key or key in seen:
                        continue
                    seen.add(key)
                    records.append(r)

        groups = {}
        seen = set()
        for r in records:
            key = r.get('rollNumber')
            if not key or key in seen:
                continue
            seen.add(key)
            sec = r.get('section') or 'Unknown'
            if sec not in groups:
                groups[sec] = []
            groups[sec].append({
                'id': r.get('studentId'),
                'name': r.get('studentName'),
                'roll': r.get('rollNumber'),
                'section': r.get('section'),
                'email': users_db.get(r.get('studentId'), {}).get('email', ''),
                'cgpa': users_db.get(r.get('studentId'), {}).get('cgpa', ''),
                'branch': users_db.get(r.get('studentId'), {}).get('branch', ''),
                'year': users_db.get(r.get('studentId'), {}).get('year', ''),
                'department': users_db.get(r.get('studentId'), {}).get('department', ''),
                'skills': users_db.get(r.get('studentId'), {}).get('skills', [])
            })

        return jsonify({'roster': groups}), 200
    except Exception as e:
        return jsonify({'error': 'Failed to compute roster', 'details': str(e)}), 500

@app.route('/api/events/<event_id>/register', methods=['POST'])
def register_event(event_id):
    try:
        if event_id not in events_db:
            return jsonify({'error': 'Event not found'}), 404
        
        data = request.get_json()
        email = data.get('email')
        
        if not email:
            return jsonify({'error': 'Email is required'}), 400
        
        # Email verification - check if email exists in users database
        if email not in users_db:
            return jsonify({'error': 'Email not registered in the system. Please sign up first.'}), 403
        
        event = events_db[event_id]
        
        # Initialize registrations list if not exists
        if 'registrations' not in event:
            event['registrations'] = []
        
        # Check if user is already registered
        if email in event['registrations']:
            return jsonify({'error': 'You are already registered for this event'}), 400
        
        # Add registration
        event['registrations'].append(email)
        event['registeredCount'] = len(event['registrations'])
        
        return jsonify({'message': 'Registered successfully', 'event': event}), 200
    except Exception as e:
        return jsonify({'error': 'Failed to register', 'details': str(e)}), 500

@app.route('/api/test-db', methods=['GET'])
def test_db():
    try:
        test_user = {
            'id': 'test_user',
            'username': 'test_user',
            'password': 'test',
            'name': None,
            'email': None,
            'role': None,
            'skills': [],
            'cgpa': None,
            'branch': None,
            'year': None,
            'department': None,
            'avatar': None
        }
        users_db['test_user'] = test_user
        return jsonify({'message': 'Database connected successfully', 'testUser': test_user}), 200
    except Exception as e:
        return jsonify({'error': 'Database connection failed', 'details': str(e)}), 500

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    """Serve React app for all non-API routes"""
    # In development, this will be handled by Vite
    # In production, serve the built index.html
    if path.startswith('api/'):
        return jsonify({'error': 'Not found'}), 404
    # Let Vite handle frontend routing in dev mode
    return jsonify({'message': 'Campus One API'}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000, host='0.0.0.0')
