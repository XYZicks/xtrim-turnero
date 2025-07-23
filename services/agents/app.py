import os
from flask import Flask
from flask_restx import Api
from dotenv import load_dotenv
from api.agents import api as agents_ns
from db import db

load_dotenv()

def create_app():
    app = Flask(__name__)
    
    # Configure database
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URI', 'postgresql://postgres:postgres@db:5432/agents')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Initialize extensions
    db.init_app(app)
    
    # Configure API
    api = Api(
        app,
        version='1.0',
        title='Xtrim Turnero API - Agents Service',
        description='API for managing agents and their availability',
        doc='/docs'
    )
    
    # Add namespaces
    api.add_namespace(agents_ns, path='/agent')
    
    @app.before_first_request
    def create_tables():
        db.create_all()
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=os.getenv('DEBUG', 'False').lower() == 'true', host='0.0.0.0', port=int(os.getenv('PORT', 5001)))