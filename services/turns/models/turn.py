from datetime import datetime
from db import db

class TurnStatus:
    WAITING = 'waiting'
    ATTENDING = 'attending'
    COMPLETED = 'completed'
    ABANDONED = 'abandoned'

class TurnType:
    NORMAL = 'normal'
    PREFERENTIAL = 'preferential'

class Turn(db.Model):
    __tablename__ = 'turns'
    
    id = db.Column(db.Integer, primary_key=True)
    ticket_number = db.Column(db.String(10), nullable=False, unique=True)
    branch_id = db.Column(db.Integer, nullable=False)
    turn_type = db.Column(db.String(20), nullable=False)
    reason = db.Column(db.String(100), nullable=False)
    status = db.Column(db.String(20), nullable=False, default=TurnStatus.WAITING)
    
    # Customer information
    customer_name = db.Column(db.String(100), nullable=True)
    customer_cedula = db.Column(db.String(20), nullable=True)
    customer_email = db.Column(db.String(100), nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    called_at = db.Column(db.DateTime, nullable=True)
    completed_at = db.Column(db.DateTime, nullable=True)
    
    # Agent information
    agent_id = db.Column(db.Integer, nullable=True)
    assigned_module = db.Column(db.String(20), nullable=True)  # Módulo asignado
    
    def __init__(self, branch_id, turn_type, reason, ticket_number, 
                 customer_name=None, customer_cedula=None, customer_email=None):
        self.branch_id = branch_id
        self.turn_type = turn_type
        self.reason = reason
        self.ticket_number = ticket_number
        self.customer_name = customer_name
        self.customer_cedula = customer_cedula
        self.customer_email = customer_email
        self.status = TurnStatus.WAITING
    
    def to_dict(self):
        return {
            'id': self.id,
            'ticket_number': self.ticket_number,
            'branch_id': self.branch_id,
            'turn_type': self.turn_type,
            'reason': self.reason,
            'status': self.status,
            'customer_name': self.customer_name,
            'customer_cedula': self.customer_cedula,
            'customer_email': self.customer_email,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'called_at': self.called_at.isoformat() if self.called_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'agent_id': self.agent_id,
            'assigned_module': self.assigned_module,
            'wait_time': (self.called_at - self.created_at).total_seconds() if self.called_at else None,
            'service_time': (self.completed_at - self.called_at).total_seconds() if self.completed_at and self.called_at else None
        }