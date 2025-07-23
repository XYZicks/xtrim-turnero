from flask import request, jsonify
from flask_restx import Namespace, Resource, fields
from models.agent import Agent
from db import db
import jwt
import datetime
import os
from werkzeug.security import generate_password_hash, check_password_hash

api = Namespace('auth', description='Authentication operations')

# Models for request/response
login_model = api.model('Login', {
    'email': fields.String(required=True, description='Agent email'),
    'password': fields.String(required=True, description='Agent password')
})

register_model = api.model('Register', {
    'name': fields.String(required=True, description='Agent name'),
    'email': fields.String(required=True, description='Agent email'),
    'password': fields.String(required=True, description='Agent password'),
    'branch_id': fields.Integer(required=True, description='Branch ID'),
    'role': fields.String(required=True, enum=['AGENTE', 'SUPERVISOR'], description='Agent role')
})

auth_response = api.model('AuthResponse', {
    'token': fields.String(description='JWT token'),
    'user': fields.Nested(api.model('User', {
        'id': fields.Integer(description='Agent ID'),
        'name': fields.String(description='Agent name'),
        'email': fields.String(description='Agent email'),
        'role': fields.String(description='Agent role'),
        'branch_id': fields.Integer(description='Branch ID')
    }))
})

# Add password and role fields to Agent model
if not hasattr(Agent, 'password'):
    Agent.password = db.Column(db.String(255), nullable=False)
    Agent.role = db.Column(db.String(20), nullable=False, default='AGENTE')

# Secret key for JWT
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'dev_secret_key')

@api.route('/login')
class Login(Resource):
    @api.doc('login')
    @api.expect(login_model)
    @api.marshal_with(auth_response)
    def post(self):
        """Login with email and password"""
        data = request.json
        
        # Find agent by email
        agent = Agent.query.filter_by(email=data['email']).first()
        
        # Check if agent exists and password is correct
        if not agent or not check_password_hash(agent.password, data['password']):
            api.abort(401, "Invalid email or password")
        
        # Generate JWT token
        token = jwt.encode({
            'id': agent.id,
            'email': agent.email,
            'role': agent.role,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, SECRET_KEY)
        
        return {
            'token': token,
            'user': {
                'id': agent.id,
                'name': agent.name,
                'email': agent.email,
                'role': agent.role,
                'branch_id': agent.branch_id
            }
        }

@api.route('/register')
class Register(Resource):
    @api.doc('register')
    @api.expect(register_model)
    @api.marshal_with(auth_response)
    def post(self):
        """Register a new agent"""
        data = request.json
        
        # Check if agent with email already exists
        if Agent.query.filter_by(email=data['email']).first():
            api.abort(400, "Agent with this email already exists")
        
        # Hash password
        hashed_password = generate_password_hash(data['password'])
        
        # Create agent
        agent = Agent(
            name=data['name'],
            email=data['email'],
            branch_id=data['branch_id']
        )
        agent.password = hashed_password
        agent.role = data['role']
        
        db.session.add(agent)
        db.session.commit()
        
        # Generate JWT token
        token = jwt.encode({
            'id': agent.id,
            'email': agent.email,
            'role': agent.role,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, SECRET_KEY)
        
        return {
            'token': token,
            'user': {
                'id': agent.id,
                'name': agent.name,
                'email': agent.email,
                'role': agent.role,
                'branch_id': agent.branch_id
            }
        }

def token_required(f):
    """Decorator to protect routes with JWT token"""
    def decorated(*args, **kwargs):
        token = None
        
        # Get token from header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
        
        if not token:
            return {'message': 'Token is missing'}, 401
        
        try:
            # Decode token
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            current_user = Agent.query.filter_by(id=data['id']).first()
        except:
            return {'message': 'Token is invalid'}, 401
        
        return f(current_user, *args, **kwargs)
    
    return decorated