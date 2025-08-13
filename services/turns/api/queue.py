from datetime import datetime
from flask_restx import Namespace, Resource, fields
from models.turn import Turn, TurnStatus, TurnType
from db import db

api = Namespace('queue', description='Queue operations')

# Models for response
turn_in_queue = api.model('TurnInQueue', {
    'id': fields.Integer(description='Turn ID'),
    'ticket_number': fields.String(description='Ticket number'),
    'turn_type': fields.String(description='Turn type'),
    'reason': fields.String(description='Reason for visit'),
    'status': fields.String(description='Turn status'),
    'customer_name': fields.String(description='Customer name'),
    'created_at': fields.DateTime(description='Creation timestamp'),
    'wait_time': fields.Integer(description='Wait time in minutes')
})

queue_response = api.model('QueueResponse', {
    'branch_id': fields.Integer(description='Branch ID'),
    'waiting_count': fields.Integer(description='Number of waiting turns'),
    'attending_count': fields.Integer(description='Number of turns being attended'),
    'preferential_waiting': fields.Integer(description='Number of preferential turns waiting'),
    'normal_waiting': fields.Integer(description='Number of normal turns waiting'),
    'queue': fields.List(fields.Nested(turn_in_queue), description='Turns in queue')
})

@api.route('/<int:branch_id>')
@api.param('branch_id', 'The branch identifier')
class QueueResource(Resource):
    @api.doc('get_queue')
    @api.marshal_with(queue_response)
    def get(self, branch_id):
        """Get the current queue for a branch"""
        # Get waiting turns
        waiting_turns = Turn.query.filter_by(
            branch_id=branch_id,
            status=TurnStatus.WAITING
        ).order_by(
            # Preferential turns first, then by creation time
            Turn.turn_type.desc(),
            Turn.created_at.asc()
        ).all()
        
        # Get attending turns
        attending_turns = Turn.query.filter_by(
            branch_id=branch_id,
            status=TurnStatus.ATTENDING
        ).all()
        
        # Count by type
        preferential_waiting = sum(1 for turn in waiting_turns if turn.turn_type == TurnType.PREFERENTIAL)
        normal_waiting = len(waiting_turns) - preferential_waiting
        
        # Format queue data
        queue_data = []
        for turn in waiting_turns:
            turn_data = {
                'id': turn.id,
                'ticket_number': turn.ticket_number,
                'turn_type': turn.turn_type,
                'reason': turn.reason,
                'status': turn.status,
                'customer_name': turn.customer_name,
                'created_at': turn.created_at,
                'wait_time': int((datetime.utcnow() - turn.created_at).total_seconds() / 60)
            }
            queue_data.append(turn_data)
        
        return {
            'branch_id': branch_id,
            'waiting_count': len(waiting_turns),
            'attending_count': len(attending_turns),
            'preferential_waiting': preferential_waiting,
            'normal_waiting': normal_waiting,
            'queue': queue_data
        }