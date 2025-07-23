import os
from flask import Flask
from flask_restx import Api
from dotenv import load_dotenv
from api.reports import api as reports_ns
from db import db

load_dotenv()

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
    
    @app.before_first_request
    def create_tables():
        db.create_all()
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=os.getenv('DEBUG', 'False').lower() == 'true', host='0.0.0.0', port=int(os.getenv('PORT', 5002)))