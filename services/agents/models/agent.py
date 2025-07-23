from datetime import datetime
from db import db

class AgentStatus:
    AVAILABLE = 'disponible'
    UNAVAILABLE = 'no_disponible'

class UnavailabilityReason:
    LUNCH = 'almuerzo'
    BREAK = 'break'
    CONSULTATION = 'consulta_jefe'
    OTHER = 'otro'

class Agent(db.Model):
    __tablename__ = 'agents'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False, unique=True)
    branch_id = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(20), nullable=False, default=AgentStatus.AVAILABLE)
    unavailability_reason = db.Column(db.String(50), nullable=True)
    last_status_change = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __init__(self, name, email, branch_id):
        self.name = name
        self.email = email
        self.branch_id = branch_id
        self.status = AgentStatus.AVAILABLE
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'branch_id': self.branch_id,
            'status': self.status,
            'unavailability_reason': self.unavailability_reason,
            'last_status_change': self.last_status_change.isoformat() if self.last_status_change else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }