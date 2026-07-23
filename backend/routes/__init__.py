from flask import Blueprint
from routes.visitors import visitors_bp
from routes.employees import employees_bp
from routes.dashboard import dashboard_bp

def register_routes(app):
    app.register_blueprint(visitors_bp, url_prefix='/api/visitors')
    app.register_blueprint(employees_bp, url_prefix='/api/employees')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
