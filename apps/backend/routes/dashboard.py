from flask import Blueprint, jsonify
from models import get_db
from datetime import datetime, date

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/stats', methods=['GET'])
def get_stats():
    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    today = date.today().isoformat()

    cursor.execute("SELECT COUNT(*) as count FROM visits WHERE DATE(check_in_time) = %s", (today,))
    today_total = cursor.fetchone()['count']

    cursor.execute("SELECT COUNT(*) as count FROM visits WHERE DATE(check_in_time) = %s AND status = 'checked_in'", (today,))
    checked_in = cursor.fetchone()['count']

    cursor.execute("SELECT COUNT(*) as count FROM visits WHERE DATE(check_in_time) = %s AND status = 'checked_out'", (today,))
    checked_out = cursor.fetchone()['count']

    cursor.execute("SELECT COUNT(*) as count FROM visitors")
    total_visitors = cursor.fetchone()['count']

    cursor.execute("SELECT COUNT(*) as count FROM employees WHERE is_active = TRUE")
    total_employees = cursor.fetchone()['count']

    cursor.close()
    conn.close()

    return jsonify({
        'today_total': today_total,
        'checked_in': checked_in,
        'checked_out': checked_out,
        'total_visitors': total_visitors,
        'total_employees': total_employees
    })

@dashboard_bp.route('/recent-activity', methods=['GET'])
def recent_activity():
    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        """SELECT al.*, v.badge_code,
                  vs.first_name as v_first, vs.last_name as v_last, vs.photo_path,
                  emp.first_name as e_first, emp.last_name as e_last
           FROM activity_log al
           LEFT JOIN visits v ON al.visit_id = v.id
           LEFT JOIN visitors vs ON v.visitor_id = vs.id
           LEFT JOIN employees emp ON v.employee_id = emp.id
           ORDER BY al.timestamp DESC LIMIT 15"""
    )
    activities = cursor.fetchall()
    cursor.close()
    conn.close()

    for a in activities:
        a['timestamp'] = a['timestamp'].strftime('%I:%M %p') if a['timestamp'] else ''

    return jsonify(activities)

@dashboard_bp.route('/today-visitors', methods=['GET'])
def today_visitors():
    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        """SELECT v.*, vs.first_name as v_first, vs.last_name as v_last, vs.phone as v_phone,
                  vs.company as v_company, vs.photo_path,
                  emp.first_name as e_first, emp.last_name as e_last, emp.department
           FROM visits v
           JOIN visitors vs ON v.visitor_id = vs.id
           JOIN employees emp ON v.employee_id = emp.id
           WHERE DATE(v.check_in_time) = CURDATE()
           ORDER BY v.check_in_time DESC"""
    )
    visitors = cursor.fetchall()
    cursor.close()
    conn.close()

    for v in visitors:
        v['check_in_time'] = v['check_in_time'].strftime('%I:%M %p') if v['check_in_time'] else None
        v['check_out_time'] = v['check_out_time'].strftime('%I:%M %p') if v['check_out_time'] else None

    return jsonify(visitors)
