import os
import sys

# Cargar variables de entorno primero
from dotenv import load_dotenv
load_dotenv()

# Importar logger después de cargar variables de entorno
from logger_config import logger

# Asegurarse de que werkzeug y flask-restx estén correctamente importados
try:
    import werkzeug
    logger.info(f"Werkzeug version: {werkzeug.__version__}")
except Exception as e:
    logger.error(f"Error importing werkzeug: {e}")
    sys.exit(1)

try:
    from flask import Flask
    logger.info(f"Flask imported successfully")
except Exception as e:
    logger.error(f"Error importing Flask: {e}")
    sys.exit(1)

try:
    from flask_restx import Api
    logger.info(f"Flask-RESTX imported successfully")
except Exception as e:
    logger.error(f"Error importing flask_restx: {e}")
    sys.exit(1)

from api.reports import api as reports_ns
from db import db

def create_app():
    app = Flask(__name__)
    
    # Configure database
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URI', 'postgresql://postgres:postgres@db:5432/reporting')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Initialize extensions
    db.init_app(app)
    
    # Configure API
    api = Api(
        app,
        version='1.0',
        title='Xtrim Turnero API - Reporting Service',
        description='API for generating reports and metrics',
        doc='/docs'
    )
    
    # Add namespaces
    api.add_namespace(reports_ns, path='/reports')
    
    # Configure logging for Flask
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
    
    with app.app_context():
        db.create_all()
        logger.info("Database tables created successfully")
    
    return app

# Crear la aplicación al nivel del módulo para gunicorn
app = create_app()

# Importar request después de crear la aplicación para evitar errores de importación circular
from flask import request

if __name__ == '__main__':
    logger.info(f"Starting Reporting Service on port {os.getenv('PORT', 5002)}")
    app.run(debug=os.getenv('DEBUG', 'False').lower() == 'true', host='0.0.0.0', port=int(os.getenv('PORT', 5002)))