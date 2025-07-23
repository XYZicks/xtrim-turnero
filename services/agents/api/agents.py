from datetime import datetime
from flask import request
from flask_restx import Namespace, Resource, fields
from models.agent import Agent, AgentStatus, UnavailabilityReason
from db import db

api = Namespace('agents', description='Agent operations')

# Models for request/response
agent_model = api.model('Agent', {
    'name': fields.String(required=True, description='Agent name'),
    'email': fields.String(required=True, description='Agent email'),
    'branch_id': fields.Integer(required=True, description='Branch ID')
})

agent_status_model = api.model('AgentStatus', {
    'status': fields.String(required=True, enum=[AgentStatus.AVAILABLE, AgentStatus.UNAVAILABLE], 
                           description='Agent status'),
    'unavailability_reason': fields.String(required=False, 
                                          enum=[UnavailabilityReason.LUNCH, UnavailabilityReason.BREAK, 
                                                UnavailabilityReason.CONSULTATION, UnavailabilityReason.OTHER], 
                                          description='Reason for unavailability')
})

agent_response = api.model('AgentResponse', {
    'id': fields.Integer(description='Agent ID'),
    'name': fields.String(description='Agent name'),
    'email': fields.String(description='Agent email'),
    'branch_id': fields.Integer(description='Branch ID'),
    'status': fields.String(description='Agent status'),
    'unavailability_reason': fields.String(description='Reason for unavailability'),
    'last_status_change': fields.DateTime(description='Last status change timestamp'),
    'created_at': fields.DateTime(description='Creation timestamp')
})

@api.route('')
class AgentList(Resource):
    @api.doc('create_agent')
    @api.expect(agent_model)
    @api.marshal_with(agent_response, code=201)
    def post(self):
        """Create a new agent"""
        data = request.json
        
        # Check if agent with email already exists
        if Agent.query.filter_by(email=data['email']).first():
            api.abort(400, "Agent with this email already exists")
        
        # Create agent
        agent = Agent(
            name=data['name'],
            email=data['email'],
            branch_id=data['branch_id']
        )
        
        db.session.add(agent)
        db.session.commit()
        
        return agent.to_dict(), 201
    
    @api.doc('list_agents')
    @api.marshal_list_with(agent_response)
    def get(self):
        """List all agents"""
        branch_id = request.args.get('branch_id')
        status = request.args.get('status')
        
        query = Agent.query
        
        if branch_id:
            query = query.filter_by(branch_id=branch_id)
        
        if status:
            query = query.filter_by(status=status)
        
        agents = query.all()
        return [agent.to_dict() for agent in agents]

@api.route('/<int:id>')
@api.param('id', 'The agent identifier')
class AgentResource(Resource):
    @api.doc('get_agent')
    @api.marshal_with(agent_response)
    def get(self, id):
        """Get an agent by ID"""
        agent = Agent.query.get_or_404(id)
        return agent.to_dict()

@api.route('/<int:id>/status')
@api.param('id', 'The agent identifier')
class AgentStatusResource(Resource):
    @api.doc('update_agent_status')
    @api.expect(agent_status_model)
    @api.marshal_with(agent_response)
    def patch(self, id):
        """Update an agent's status"""
        agent = Agent.query.get_or_404(id)
        data = request.json
        
        # Update status
        agent.status = data['status']
        agent.last_status_change = datetime.utcnow()
        
        # Update unavailability reason if status is unavailable
        if data['status'] == AgentStatus.UNAVAILABLE:
            if 'unavailability_reason' not in data:
                api.abort(400, "Unavailability reason is required when status is unavailable")
            agent.unavailability_reason = data['unavailability_reason']
        else:
            agent.unavailability_reason = None
        
        db.session.commit()
        
        return agent.to_dict()