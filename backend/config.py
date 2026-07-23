import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'vms-secret-key-2024')
    MYSQL_HOST = os.environ.get('MYSQL_HOST', 'localhost')
    MYSQL_USER = os.environ.get('MYSQL_USER', 'root')
    MYSQL_PASSWORD = os.environ.get('MYSQL_PASSWORD', '')
    MYSQL_DB = os.environ.get('MYSQL_DB', 'visitor_management')
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static', 'uploads')
    BADGE_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static', 'badges')
    FACE_MATCH_THRESHOLD = 0.4
