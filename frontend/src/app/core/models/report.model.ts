export interface Report {
  id: number;
  branch_id: number;
  report_date: string;
  total_turns: number;
  completed_turns: number;
  abandoned_turns: number;
  avg_wait_time: number;
  avg_service_time: number;
  unique_customers: number;
  created_at: string;
}

export interface Metrics {
  total_turns: number;
  completed_turns: number;
  abandoned_turns: number;
  abandonment_rate: number;
  avg_wait_time: number;
  avg_service_time: number;
  unique_customers: number;
  daily_metrics: Report[];
}

export interface ReportParams {
  branch_id?: number;
  start_date: string;
  end_date: string;
  format?: 'json' | 'csv';
}