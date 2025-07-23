from datetime import datetime, timedelta
from flask import request, Response
from flask_restx import Namespace, Resource, fields
from models.report import Report
from db import db
import pandas as pd
import io
import json

api = Namespace('reports', description='Reporting operations')

# Models for request/response
report_params = api.model('ReportParams', {
    'branch_id': fields.Integer(required=False, description='Branch ID'),
    'start_date': fields.Date(required=True, description='Start date (YYYY-MM-DD)'),
    'end_date': fields.Date(required=True, description='End date (YYYY-MM-DD)'),
    'format': fields.String(required=False, enum=['json', 'csv'], default='json', description='Response format')
})

report_response = api.model('ReportResponse', {
    'branch_id': fields.Integer(description='Branch ID'),
    'report_date': fields.Date(description='Report date'),
    'total_turns': fields.Integer(description='Total turns'),
    'completed_turns': fields.Integer(description='Completed turns'),
    'abandoned_turns': fields.Integer(description='Abandoned turns'),
    'avg_wait_time': fields.Float(description='Average wait time (minutes)'),
    'avg_service_time': fields.Float(description='Average service time (minutes)'),
    'unique_customers': fields.Integer(description='Unique customers'),
})

metrics_response = api.model('MetricsResponse', {
    'total_turns': fields.Integer(description='Total turns'),
    'completed_turns': fields.Integer(description='Completed turns'),
    'abandoned_turns': fields.Integer(description='Abandoned turns'),
    'abandonment_rate': fields.Float(description='Abandonment rate (%)'),
    'avg_wait_time': fields.Float(description='Average wait time (minutes)'),
    'avg_service_time': fields.Float(description='Average service time (minutes)'),
    'unique_customers': fields.Integer(description='Unique customers'),
    'daily_metrics': fields.List(fields.Nested(report_response), description='Daily metrics')
})

@api.route('/metrics')
class MetricsResource(Resource):
    @api.doc('get_metrics')
    @api.expect(report_params)
    def get(self):
        """Get metrics for a date range"""
        # Parse parameters
        branch_id = request.args.get('branch_id', type=int)
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        format_type = request.args.get('format', 'json')
        
        if not start_date or not end_date:
            api.abort(400, "start_date and end_date are required")
        
        try:
            start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
            end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
        except ValueError:
            api.abort(400, "Invalid date format. Use YYYY-MM-DD")
        
        # Build query
        query = Report.query.filter(
            Report.report_date >= start_date,
            Report.report_date <= end_date
        )
        
        if branch_id:
            query = query.filter_by(branch_id=branch_id)
        
        reports = query.all()
        
        # For CSV format, return a downloadable file
        if format_type == 'csv':
            if not reports:
                return Response("No data available for the selected period", 
                               mimetype='text/plain')
            
            # Convert to pandas DataFrame
            data = [report.to_dict() for report in reports]
            df = pd.DataFrame(data)
            
            # Generate CSV
            output = io.StringIO()
            df.to_csv(output, index=False)
            
            # Create response
            response = Response(
                output.getvalue(),
                mimetype='text/csv',
                headers={'Content-Disposition': 'attachment; filename=report.csv'}
            )
            return response
        
        # For JSON format, return aggregated metrics
        total_turns = sum(report.total_turns for report in reports)
        completed_turns = sum(report.completed_turns for report in reports)
        abandoned_turns = sum(report.abandoned_turns for report in reports)
        
        # Calculate abandonment rate
        abandonment_rate = 0
        if total_turns > 0:
            abandonment_rate = (abandoned_turns / total_turns) * 100
        
        # Calculate average wait and service times
        avg_wait_time = 0
        avg_service_time = 0
        
        if reports:
            wait_times = [report.avg_wait_time for report in reports if report.avg_wait_time > 0]
            service_times = [report.avg_service_time for report in reports if report.avg_service_time > 0]
            
            if wait_times:
                avg_wait_time = sum(wait_times) / len(wait_times)
            
            if service_times:
                avg_service_time = sum(service_times) / len(service_times)
        
        # Count unique customers (simplified for MVP)
        unique_customers = sum(report.unique_customers for report in reports)
        
        # Format daily metrics
        daily_metrics = [report.to_dict() for report in reports]
        
        return {
            'total_turns': total_turns,
            'completed_turns': completed_turns,
            'abandoned_turns': abandoned_turns,
            'abandonment_rate': round(abandonment_rate, 2),
            'avg_wait_time': round(avg_wait_time, 2),
            'avg_service_time': round(avg_service_time, 2),
            'unique_customers': unique_customers,
            'daily_metrics': daily_metrics
        }