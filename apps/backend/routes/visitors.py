from flask import Blueprint, request, jsonify, current_app
from models import get_db
from face_module import extract_face_embedding, serialize_embedding, deserialize_embedding, find_matching_visitor, extract_face_embedding_from_frame
from config import Config
import cv2
import numpy as np
import uuid
import os
import base64
from datetime import datetime

visitors_bp = Blueprint('visitors', __name__)

def log_activity(cursor, visit_id, action, description):
    cursor.execute(
        "INSERT INTO activity_log (visit_id, action, description) VALUES (%s, %s, %s)",
        (visit_id, action, description)
    )

@visitors_bp.route('/capture-face', methods=['POST'])
def capture_face():
    data = request.get_json()
    if not data or 'image' not in data:
        return jsonify({'error': 'No image provided'}), 400

    image_data = data['image']
    if ',' in image_data:
        image_data = image_data.split(',')[1]

    image_bytes = base64.b64decode(image_data)
    embedding, bbox = extract_face_embedding(image_bytes)

    if embedding is None:
        return jsonify({'error': 'No face detected', 'detected': False}), 200

    conn = get_db()
    cursor = conn.cursor()
    match_id, similarity = find_matching_visitor(cursor, embedding, Config.FACE_MATCH_THRESHOLD)
    cursor.close()
    conn.close()

    response = {
        'detected': True,
        'bbox': bbox,
        'similarity': similarity,
        'image': data['image']
    }

    if match_id:
        conn = get_db()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM visitors WHERE id = %s", (match_id,))
        visitor = cursor.fetchone()
        cursor.close()
        conn.close()

        response['existing_visitor'] = {
            'id': visitor['id'],
            'first_name': visitor['first_name'],
            'last_name': visitor['last_name'],
            'email': visitor['email'],
            'phone': visitor['phone'],
            'company': visitor['company'],
            'photo_path': visitor['photo_path']
        }
        response['welcome_back'] = True

    return jsonify(response)

@visitors_bp.route('/check-in', methods=['POST'])
def check_in():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    visitor_id = data.get('visitor_id')
    employee_id = data.get('employee_id')
    purpose = data.get('purpose', '')
    floor = data.get('floor', '')
    notes = data.get('notes', '')
    image = data.get('image')

    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    if not visitor_id:
        first_name = data.get('first_name', '')
        last_name = data.get('last_name', '')
        email = data.get('email', '')
        phone = data.get('phone', '')
        company = data.get('company', '')
        id_type = data.get('id_type', '')
        id_number = data.get('id_number', '')

        embedding = None
        photo_path = None

        if image:
            if ',' in image:
                image_data = image.split(',')[1]
            else:
                image_data = image
            image_bytes = base64.b64decode(image_data)
            emb, _ = extract_face_embedding(image_bytes)
            if emb is not None:
                embedding = serialize_embedding(emb)

            photo_filename = f"{uuid.uuid4().hex}.jpg"
            photo_path = os.path.join(Config.UPLOAD_FOLDER, photo_filename)
            with open(photo_path, 'wb') as f:
                f.write(image_bytes)
            photo_path = f"static/uploads/{photo_filename}"

        cursor.execute(
            """INSERT INTO visitors (first_name, last_name, email, phone, company, id_type, id_number, photo_path, face_embedding)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)""",
            (first_name, last_name, email, phone, company, id_type, id_number, photo_path, embedding)
        )
        visitor_id = cursor.lastrowid

    badge_code = f"VMS-{uuid.uuid4().hex[:8].upper()}"

    cursor.execute(
        """INSERT INTO visits (visitor_id, employee_id, purpose, badge_code, floor, notes, status)
           VALUES (%s, %s, %s, %s, %s, %s, 'checked_in')""",
        (visitor_id, employee_id, purpose, badge_code, floor, notes)
    )
    visit_id = cursor.lastrowid

    cursor.execute("SELECT first_name, last_name FROM visitors WHERE id = %s", (visitor_id,))
    visitor = cursor.fetchone()

    cursor.execute("SELECT first_name, last_name FROM employees WHERE id = %s", (employee_id,))
    employee = cursor.fetchone()

    log_activity(cursor, visit_id, 'check_in',
                 f"{visitor['first_name']} {visitor['last_name']} checked in to meet {employee['first_name']} {employee['last_name']}")

    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({
        'success': True,
        'visit_id': visit_id,
        'badge_code': badge_code,
        'visitor_id': visitor_id,
        'visitor_name': f"{visitor['first_name']} {visitor['last_name']}"
    })

@visitors_bp.route('/check-out', methods=['POST'])
def check_out():
    data = request.get_json()
    if not data or 'image' not in data:
        return jsonify({'error': 'No image provided'}), 400

    image_data = data['image']
    if ',' in image_data:
        image_data = image_data.split(',')[1]

    image_bytes = base64.b64decode(image_data)
    embedding, bbox = extract_face_embedding(image_bytes)

    if embedding is None:
        return jsonify({'error': 'No face detected', 'detected': False}), 200

    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    match_id, similarity = find_matching_visitor(cursor, embedding, Config.FACE_MATCH_THRESHOLD)

    if not match_id:
        cursor.close()
        conn.close()
        return jsonify({'error': 'Visitor not recognized', 'detected': True, 'recognized': False}), 200

    cursor.execute(
        """SELECT v.id as visit_id, v.check_in_time, vs.first_name, vs.last_name, vs.photo_path
           FROM visits v JOIN visitors vs ON v.visitor_id = vs.id
           WHERE v.visitor_id = %s AND v.status = 'checked_in'
           ORDER BY v.check_in_time DESC LIMIT 1""",
        (match_id,)
    )
    visit = cursor.fetchone()

    if not visit:
        cursor.close()
        conn.close()
        return jsonify({'error': 'No active visit found for this visitor'}), 200

    now = datetime.now()
    check_in_time = visit['check_in_time']
    duration = int((now - check_in_time).total_seconds() / 60)

    cursor.execute(
        """UPDATE visits SET check_out_time = %s, duration_minutes = %s, status = 'checked_out'
           WHERE id = %s""",
        (now, duration, visit['visit_id'])
    )

    log_activity(cursor, visit['visit_id'], 'check_out',
                 f"{visit['first_name']} {visit['last_name']} checked out after {duration} minutes")

    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({
        'success': True,
        'recognized': True,
        'detected': True,
        'visitor_name': f"{visit['first_name']} {visit['last_name']}",
        'check_in_time': check_in_time.strftime('%I:%M %p'),
        'check_out_time': now.strftime('%I:%M %p'),
        'duration_minutes': duration,
        'photo_path': visit['photo_path']
    })

@visitors_bp.route('/history', methods=['GET'])
def visitor_history():
    search = request.args.get('search', '')
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 20))

    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    where_clauses = []
    params = []

    if search:
        where_clauses.append("(vs.first_name LIKE %s OR vs.last_name LIKE %s OR vs.phone LIKE %s OR vs.company LIKE %s OR emp.first_name LIKE %s OR emp.last_name LIKE %s OR DATE(v.check_in_time) = %s)")
        search_param = f"%{search}%"
        params.extend([search_param]*6)
        params.append(search)

    where_sql = " AND ".join(where_clauses) if where_clauses else "1=1"

    count_query = f"SELECT COUNT(*) as total FROM visits v JOIN visitors vs ON v.visitor_id = vs.id JOIN employees emp ON v.employee_id = emp.id WHERE {where_sql}"
    cursor.execute(count_query, params)
    total = cursor.fetchone()['total']

    offset = (page - 1) * per_page
    query = f"""
        SELECT v.id, v.purpose, v.check_in_time, v.check_out_time, v.duration_minutes, v.badge_code, v.status,
               vs.id as visitor_id, vs.first_name as v_first_name, vs.last_name as v_last_name, vs.phone as v_phone, vs.company as v_company, vs.photo_path,
               emp.first_name as e_first_name, emp.last_name as e_last_name, emp.department
        FROM visits v
        JOIN visitors vs ON v.visitor_id = vs.id
        JOIN employees emp ON v.employee_id = emp.id
        WHERE {where_sql}
        ORDER BY v.check_in_time DESC
        LIMIT %s OFFSET %s
    """
    cursor.execute(query, params + [per_page, offset])
    visits = cursor.fetchall()

    cursor.close()
    conn.close()

    for v in visits:
        v['check_in_time'] = v['check_in_time'].strftime('%Y-%m-%d %I:%M %p') if v['check_in_time'] else None
        v['check_out_time'] = v['check_out_time'].strftime('%Y-%m-%d %I:%M %p') if v['check_out_time'] else None

    return jsonify({
        'visits': visits,
        'total': total,
        'page': page,
        'per_page': per_page,
        'total_pages': (total + per_page - 1) // per_page
    })

@visitors_bp.route('/profile/<int:visitor_id>', methods=['GET'])
def visitor_profile(visitor_id):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM visitors WHERE id = %s", (visitor_id,))
    visitor = cursor.fetchone()
    if not visitor:
        cursor.close()
        conn.close()
        return jsonify({'error': 'Visitor not found'}), 404

    cursor.execute(
        """SELECT v.*, emp.first_name as e_first_name, emp.last_name as e_last_name, emp.department
           FROM visits v JOIN employees emp ON v.employee_id = emp.id
           WHERE v.visitor_id = %s ORDER BY v.check_in_time DESC""",
        (visitor_id,)
    )
    visits = cursor.fetchall()

    for v in visits:
        v['check_in_time'] = v['check_in_time'].strftime('%Y-%m-%d %I:%M %p') if v['check_in_time'] else None
        v['check_out_time'] = v['check_out_time'].strftime('%Y-%m-%d %I:%M %p') if v['check_out_time'] else None

    cursor.close()
    conn.close()

    return jsonify({
        'visitor': visitor,
        'visits': visits,
        'total_visits': len(visits),
        'total_duration': sum(v['duration_minutes'] or 0 for v in visits)
    })

@visitors_bp.route('/export', methods=['GET'])
def export_history():
    import pandas as pd
    from flask import send_file

    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        """SELECT v.id, vs.first_name, vs.last_name, vs.phone, vs.company, vs.email,
                  emp.first_name as host_first, emp.last_name as host_last, emp.department,
                  v.purpose, v.check_in_time, v.check_out_time, v.duration_minutes, v.badge_code, v.status
           FROM visits v
           JOIN visitors vs ON v.visitor_id = vs.id
           JOIN employees emp ON v.employee_id = emp.id
           ORDER BY v.check_in_time DESC"""
    )
    visits = cursor.fetchall()
    cursor.close()
    conn.close()

    for v in visits:
        v['check_in_time'] = v['check_in_time'].strftime('%Y-%m-%d %H:%M') if v['check_in_time'] else ''
        v['check_out_time'] = v['check_out_time'].strftime('%Y-%m-%d %H:%M') if v['check_out_time'] else ''
        v['visitor_name'] = f"{v.pop('first_name')} {v.pop('last_name')}"
        v['host_name'] = f"{v.pop('host_first')} {v.pop('host_last')}"

    fmt = request.args.get('format', 'excel')
    df = pd.DataFrame(visits)

    if fmt == 'pdf':
        from reportlab.lib.pagesizes import A4
        from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
        from reportlab.lib.styles import getSampleStyleSheet
        from reportlab.lib import colors

        filepath = os.path.join(Config.BADGE_FOLDER, 'visitor_history.pdf')
        doc = SimpleDocTemplate(filepath, pagesize=A4, topMargin=30)
        elements = []
        styles = getSampleStyleSheet()
        elements.append(Paragraph("Visitor History Report", styles['Title']))
        elements.append(Spacer(1, 20))

        headers = ['Visitor', 'Host', 'Purpose', 'Check In', 'Check Out', 'Duration (min)', 'Status']
        data = [headers]
        for v in visits:
            data.append([
                v.get('visitor_name', ''),
                v.get('host_name', ''),
                str(v.get('purpose', ''))[:30],
                v.get('check_in_time', ''),
                v.get('check_out_time', ''),
                str(v.get('duration_minutes', '')),
                v.get('status', '')
            ])

        table = Table(data, repeatRows=1)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4F46E5')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F3F4F6')]),
        ]))
        elements.append(table)
        doc.build(elements)
        return send_file(filepath, as_attachment=True, download_name='visitor_history.pdf')

    filepath = os.path.join(Config.BADGE_FOLDER, 'visitor_history.xlsx')
    df.to_excel(filepath, index=False, sheet_name='Visitor History')
    return send_file(filepath, as_attachment=True, download_name='visitor_history.xlsx')
