from flask import Blueprint, request, jsonify
from models import get_db

employees_bp = Blueprint('employees', __name__)

@employees_bp.route('', methods=['GET'])
def list_employees():
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    search = request.args.get('search', '')

    if search:
        cursor.execute(
            """SELECT * FROM employees
               WHERE first_name LIKE %s OR last_name LIKE %s OR email LIKE %s OR department LIKE %s
               ORDER BY first_name""",
            (f"%{search}%",)*4
        )
    else:
        cursor.execute("SELECT * FROM employees ORDER BY first_name")

    employees = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(employees)

@employees_bp.route('', methods=['POST'])
def create_employee():
    data = request.get_json()
    conn = get_db()
    cursor = conn.cursor()

    try:
        cursor.execute(
            """INSERT INTO employees (first_name, last_name, email, phone, department, designation, floor)
               VALUES (%s, %s, %s, %s, %s, %s, %s)""",
            (data['first_name'], data['last_name'], data['email'],
             data.get('phone', ''), data.get('department', ''), data.get('designation', ''), data.get('floor', ''))
        )
        conn.commit()
        emp_id = cursor.lastrowid
        return jsonify({'success': True, 'id': emp_id})
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        cursor.close()
        conn.close()

@employees_bp.route('/<int:emp_id>', methods=['PUT'])
def update_employee(emp_id):
    data = request.get_json()
    conn = get_db()
    cursor = conn.cursor()

    try:
        cursor.execute(
            """UPDATE employees SET first_name=%s, last_name=%s, email=%s, phone=%s,
               department=%s, designation=%s, floor=%s, is_active=%s WHERE id=%s""",
            (data['first_name'], data['last_name'], data['email'],
             data.get('phone', ''), data.get('department', ''), data.get('designation', ''),
             data.get('floor', ''), data.get('is_active', True), emp_id)
        )
        conn.commit()
        return jsonify({'success': True})
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        cursor.close()
        conn.close()

@employees_bp.route('/<int:emp_id>', methods=['DELETE'])
def delete_employee(emp_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE employees SET is_active = FALSE WHERE id = %s", (emp_id,))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({'success': True})

@employees_bp.route('/list', methods=['GET'])
def employee_list():
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, first_name, last_name, department, floor FROM employees WHERE is_active = TRUE ORDER BY first_name")
    employees = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(employees)
