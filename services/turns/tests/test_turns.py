import unittest
import json
from app import create_app
from db import db
from models.turn import Turn, TurnStatus, TurnType

class TurnsTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.app.config['TESTING'] = True
        self.app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        self.client = self.app.test_client()
        
        with self.app.app_context():
            db.create_all()
    
    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.drop_all()
    
    def test_create_turn(self):
        """Test creating a new turn"""
        turn_data = {
            'branch_id': 1,
            'turn_type': TurnType.NORMAL,
            'reason': 'Test reason'
        }
        
        response = self.client.post(
            '/turns',
            data=json.dumps(turn_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.data)
        self.assertEqual(data['branch_id'], 1)
        self.assertEqual(data['turn_type'], TurnType.NORMAL)
        self.assertEqual(data['reason'], 'Test reason')
        self.assertEqual(data['status'], TurnStatus.WAITING)
    
    def test_create_preferential_turn_without_cedula(self):
        """Test creating a preferential turn without cedula should fail"""
        turn_data = {
            'branch_id': 1,
            'turn_type': TurnType.PREFERENTIAL,
            'reason': 'Test reason'
        }
        
        response = self.client.post(
            '/turns',
            data=json.dumps(turn_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 400)
    
    def test_get_turn(self):
        """Test getting a turn by ID"""
        # Create a turn first
        turn = Turn(
            branch_id=1,
            turn_type=TurnType.NORMAL,
            reason='Test reason',
            ticket_number='AB123'
        )
        
        with self.app.app_context():
            db.session.add(turn)
            db.session.commit()
            turn_id = turn.id
        
        response = self.client.get(f'/turns/{turn_id}')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertEqual(data['id'], turn_id)
        self.assertEqual(data['ticket_number'], 'AB123')
    
    def test_update_turn_status(self):
        """Test updating a turn's status"""
        # Create a turn first
        turn = Turn(
            branch_id=1,
            turn_type=TurnType.NORMAL,
            reason='Test reason',
            ticket_number='AB123'
        )
        
        with self.app.app_context():
            db.session.add(turn)
            db.session.commit()
            turn_id = turn.id
        
        update_data = {
            'status': TurnStatus.ATTENDING,
            'agent_id': 1
        }
        
        response = self.client.patch(
            f'/turns/{turn_id}',
            data=json.dumps(update_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['status'], TurnStatus.ATTENDING)
        self.assertEqual(data['agent_id'], 1)

if __name__ == '__main__':
    unittest.main()