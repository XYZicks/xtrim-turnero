import os
import sys
from dotenv import load_dotenv
load_dotenv()

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from common.logger import configure_logger, logger

configure_logger("agents")

# Imports de Flask y extensiones
from flask import Flask
from flask_restx import Api
from flask_cors import CORS

# Namespaces y DB
from api.agents import api as agents_ns
from api.auth   import api as auth_ns
from db import db

def create_app():
    app = Flask(__name__)

    # 1) Configura CORS ANTES de registrar los namespaces
    #    Permite solo tu Angular dev en localhost:4200
    CORS(app,
         resources={
           r"/auth/*": {"origins": "http://localhost:4200"},
           r"/agent/*": {"origins": "http://localhost:4200"}
         },
         methods=["GET","POST","PUT","DELETE","OPTIONS"],
         allow_headers=["Content-Type","Authorization"]
    )

    # 2) Configura la DB
    app.config['SQLALCHEMY_DATABASE_URI']        = os.getenv('DATABASE_URI', 'postgresql://postgres:postgres@db:5432/agents')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(app)

    # 3) Levanta la API
    api = Api(
        app,
        version='1.0',
        title='Xtrim Turnero API - Agents Service',
        description='API for managing agents and their availability',
        doc='/docs'
    )
    api.add_namespace(agents_ns, path='/agent')
    api.add_namespace(auth_ns,    path='/auth')

    # 4) Crea tablas si es necesario
    with app.app_context():
        db.create_all()
        logger.info("Database tables created successfully")

    return app

# --- nivel módulo para gunicorn ---
app = create_app()
logger.info("Agents Service application created")

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5001))
    debug = os.getenv('DEBUG', 'False').lower() == 'true'
    logger.info(f"Starting Agents Service on port {port}")
    app.run(debug=debug, host='0.0.0.0', port=port)
