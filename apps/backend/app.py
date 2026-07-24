import os
import sys
from flask import Flask, send_from_directory
from flask_cors import CORS
from config import Config
from models import init_db
from routes import register_routes

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)

register_routes(app)

@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory('static', filename)

@app.route('/api/health', methods=['GET'])
def health_check():
    return {'status': 'healthy', 'message': 'Visitor Management System API is running'}

if __name__ == '__main__':
    os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
    os.makedirs(Config.BADGE_FOLDER, exist_ok=True)

    try:
        init_db()
        print("Database initialized successfully")
    except Exception as e:
        print(f"Database initialization warning: {e}")

    app.run(debug=True, port=5000)
