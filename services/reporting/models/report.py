from datetime import datetime
from db import db

class Report(db.Model):
    __tablename__ = 'reports'
    
    id = db.Column(db.Integer, primary_key=True)
    branch_id = db.Column(db.Integer, nullable=False)
    report_date = db.Column(db.Date, nullable=False)
    total_turns = db.Column(db.Integer, default=0)
    completed_turns = db.Column(db.Integer, default=0)
    abandoned_turns = db.Column(db.Integer, default=0)
    avg_wait_time = db.Column(db.Float, default=0)  # in minutes
    avg_service_time = db.Column(db.Float, default=0)  # in minutes
    unique_customers = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __init__(self, branch_id, report_date, total_turns=0, completed_turns=0, 
                 abandoned_turns=0, avg_wait_time=0, avg_service_time=0, unique_customers=0):
        self.branch_id = branch_id
        self.report_date = report_date
        self.total_turns = total_turns
        self.completed_turns = completed_turns
        self.abandoned_turns = abandoned_turns
        self.avg_wait_time = avg_wait_time
        self.avg_service_time = avg_service_time
        self.unique_customers = unique_customers
    
    def to_dict(self):
        return {
            'id': self.id,
            'branch_id': self.branch_id,
            'report_date': self.report_date.isoformat() if self.report_date else None,
            'total_turns': self.total_turns,
            'completed_turns': self.completed_turns,
            'abandoned_turns': self.abandoned_turns,
            'avg_wait_time': self.avg_wait_time,
            'avg_service_time': self.avg_service_time,
            'unique_customers': self.unique_customers,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }