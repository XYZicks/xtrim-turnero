from datetime import datetime
from flask import request
from flask_restx import Namespace, Resource, fields
from models.turn import Turn, TurnStatus, TurnType
from db import db
import random
import string

api = Namespace('turns', description='Turn operations')

# Models for request/response
turn_model = api.model('Turn', {
    'branch_id': fields.Integer(required=True, description='Branch ID'),
    'turn_type': fields.String(required=True, enum=[TurnType.NORMAL, TurnType.PREFERENTIAL], description='Turn type'),
    'reason': fields.String(required=True, description='Reason for visit'),
    'customer_name': fields.String(required=False, description='Customer name'),
    'customer_cedula': fields.String(required=False, description='Customer ID number'),
    'customer_email': fields.String(required=False, description='Customer email')
})

turn_response = api.model('TurnResponse', {
    'id': fields.Integer(description='Turn ID'),
    'ticket_number': fields.String(description='Ticket number'),
    'branch_id': fields.Integer(description='Branch ID'),
    'turn_type': fields.String(description='Turn type'),
    'reason': fields.String(description='Reason for visit'),
    'status': fields.String(description='Turn status'),
    'created_at': fields.DateTime(description='Creation timestamp'),
    'estimated_wait': fields.Integer(description='Estimated wait time in minutes')
})

turn_update = api.model('TurnUpdate', {
    'status': fields.String(required=True, enum=[TurnStatus.ATTENDING, TurnStatus.COMPLETED, TurnStatus.ABANDONED], 
                           description='New turn status'),
    'agent_id': fields.Integer(required=False, description='Agent ID')
})

def generate_ticket_number():
    """Generate a unique ticket number"""
    letters = ''.join(random.choices(string.ascii_uppercase, k=2))
    numbers = ''.join(random.choices(string.digits, k=3))
    return f"{letters}{numbers}"

@api.route('')
class TurnList(Resource):
    @api.doc('create_turn')
    @api.expect(turn_model)
    @api.marshal_with(turn_response, code=201)
    def post(self):
        """Create a new turn"""
        data = request.json
        
        # Validate preferential turn has cedula
        if data['turn_type'] == TurnType.PREFERENTIAL and not data.get('customer_cedula'):
            api.abort(400, "Preferential turns require customer cedula")
        
        # Generate ticket number
        ticket_number = generate_ticket_number()
        
        # Create turn
        turn = Turn(
            branch_id=data['branch_id'],
            turn_type=data['turn_type'],
            reason=data['reason'],
            ticket_number=ticket_number,
            customer_name=data.get('customer_name'),
            customer_cedula=data.get('customer_cedula'),
            customer_email=data.get('customer_email')
        )
        
        db.session.add(turn)
        db.session.commit()
        
        # Calculate estimated wait time (simplified for MVP)
        waiting_turns = Turn.query.filter_by(
            branch_id=data['branch_id'], 
            status=TurnStatus.WAITING
        ).count()
        
        # Assume 5 minutes per turn on average
        estimated_wait = max(1, waiting_turns * 5)
        
        response_data = turn.to_dict()
        response_data['estimated_wait'] = estimated_wait
        
        return response_data, 201

@api.route('/<int:id>')
@api.param('id', 'The turn identifier')
class TurnResource(Resource):
    @api.doc('get_turn')
    @api.marshal_with(turn_response)
    def get(self, id):
        """Get a turn by ID"""
        turn = Turn.query.get_or_404(id)
        
        # Calculate estimated wait time (simplified for MVP)
        waiting_turns_ahead = Turn.query.filter(
            Turn.branch_id == turn.branch_id,
            Turn.status == TurnStatus.WAITING,
            Turn.created_at < turn.created_at
        ).count()
        
        # Preferential turns get priority
        if turn.turn_type != TurnType.PREFERENTIAL:
            preferential_turns = Turn.query.filter(
                Turn.branch_id == turn.branch_id,
                Turn.status == TurnStatus.WAITING,
                Turn.turn_type == TurnType.PREFERENTIAL,
                Turn.created_at > turn.created_at
            ).count()
            waiting_turns_ahead += preferential_turns
        
        # Assume 5 minutes per turn on average
        estimated_wait = max(1, waiting_turns_ahead * 5)
        
        response_data = turn.to_dict()
        response_data['estimated_wait'] = estimated_wait
        
        return response_data
    
    @api.doc('update_turn')
    @api.expect(turn_update)
    @api.marshal_with(turn_response)
    def patch(self, id):
        """Update a turn's status"""
        turn = Turn.query.get_or_404(id)
        data = request.json
        
        # Update status
        turn.status = data['status']
        
        # Update timestamps based on status
        if data['status'] == TurnStatus.ATTENDING:
            turn.called_at = datetime.utcnow()
            turn.agent_id = data.get('agent_id')
        elif data['status'] in [TurnStatus.COMPLETED, TurnStatus.ABANDONED]:
            turn.completed_at = datetime.utcnow()
        
        db.session.commit()
        
        return turn.to_dict()