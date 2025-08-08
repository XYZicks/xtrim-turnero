# app.py
import os
import sys

from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_restx import Api
from flask_cors import CORS

load_dotenv()

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from common.logger import configure_logger, logger

configure_logger("turns")

from api.turns import api as turns_ns
from api.queue import api as queue_ns
from db import db

# Cargar variables de entorno\load_dotenv()

def create_app():
    app = Flask(__name__)

    # Habilitar CORS para los endpoints
    CORS(
        app,
        resources={
            r"/turns/*": {"origins": "http://localhost:4200"},
            r"/queue/*": {"origins": "http://localhost:4200"}
        },
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization"]
    )

    # Configurar base de datos
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
        "DATABASE_URI",
        "postgresql://postgres:postgres@db:5432/turns"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # Inicializar extensiones
    db.init_app(app)

    # Configurar la API con Flask-RESTX
    api = Api(
        app,
        version="1.0",
        title="Xtrim Turnero API - Turns Service",
        description="API for managing turns and queues",
        doc="/docs"
    )

    # Registrar namespaces
    api.add_namespace(turns_ns, path="/turns")
    api.add_namespace(queue_ns, path="/queue")

    # Logging de requests
    @app.before_request
    def log_request_info():
        logger.info(f"Request: {request.method} {request.path} - Client: {request.remote_addr}")

    # Logging de responses
    @app.after_request
    def log_response_info(response):
        logger.info(f"Response: {response.status_code} for {request.method} {request.path}")
        return response

    # Handler para errores HTTP (404, 405, etc.)
    @app.errorhandler(404)
    def handle_404(e):
        logger.warning(f"Not Found: {request.path}")
        return jsonify({"error": "Resource not found"}), 404

    @app.errorhandler(405)
    def handle_405(e):
        logger.warning(f"Method Not Allowed: {request.method} on {request.path}")
        return jsonify({"error": "Method not allowed"}), 405

    # Handler para excepciones genéricas
    @app.errorhandler(Exception)
    def handle_exception(e):
        logger.error(f"Unhandled exception: {str(e)}", exc_info=True)
        # Si es HTTPException, usa su código y mensaje
        from werkzeug.exceptions import HTTPException
        if isinstance(e, HTTPException):
            return jsonify({"error": e.description}), e.code
        return jsonify({"error": "Internal server error"}), 500

    # Crear tablas al arrancar
    with app.app_context():
        db.create_all()
        logger.info("Database tables created successfully")

    return app


# Crear la aplicación al nivel de módulo para Gunicorn
app = create_app()
logger.info("Turns Service application created")

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("DEBUG", "False").lower() == "true"
    logger.info(f"Starting Turns Service on port {port}")
    app.run(
        debug=debug,
        host="0.0.0.0",
        port=port
    )
