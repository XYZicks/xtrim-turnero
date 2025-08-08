# app.py
import os
import sys
from dotenv import load_dotenv
load_dotenv()

from logger_config import logger

# Imports de Flask y extensiones
from flask import Flask, request
from flask_restx import Api
from flask_cors import CORS

from api.reports import api as reports_ns
from db import db

def create_app():
    app = Flask(__name__)

    # 1) CORS: permite que tu frontend (p.ej. http://localhost:4200) consuma esta API
    CORS(
        app,
        resources={r"/reports/*": {"origins": "http://localhost:4200"}},
        methods=["GET","POST","PUT","DELETE","OPTIONS"],
        allow_headers=["Content-Type","Authorization"]
    )

    # 2) Configura la base de datos
    app.config['SQLALCHEMY_DATABASE_URI']        = os.getenv('DATABASE_URI', 'postgresql://postgres:postgres@db:5432/reporting')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(app)

    # 3) Levanta la API
    api = Api(
        app,
        version='1.0',
        title='Xtrim Turnero API - Reporting Service',
        description='API for generating reports and metrics',
        doc='/docs'
    )
    api.add_namespace(reports_ns, path='/reports')

    # 4) Logging de requests/responses
    @app.before_request
    def log_request_info():
        logger.info(f"Request: {request.method} {request.path} - Client: {request.remote_addr}")

    @app.after_request
    def log_response_info(response):
        logger.info(f"Response: {response.status_code}")
        return response

    @app.errorhandler(Exception)
    def handle_exception(e):
        logger.error(f"Unhandled exception: {str(e)}", exception=e)
        return {"error": "Internal server error"}, 500

    # 5) Crea tablas si no existen
    with app.app_context():
        db.create_all()
        logger.info("Database tables created successfully")

    return app

# Nivel módulo para gunicorn
app = create_app()
logger.info("Reporting Service application created")

if __name__ == '__main__':
    port  = int(os.getenv('PORT', 5002))
    debug = os.getenv('DEBUG', 'False').lower() == 'true'
    logger.info(f"Starting Reporting Service on port {port}")
    app.run(debug=debug, host='0.0.0.0', port=port)
