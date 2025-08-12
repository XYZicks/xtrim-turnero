export interface Turn {
  id: number;
  ticket_number: string;
  branch_id: number;
  turn_type: 'normal' | 'preferential';
  reason: string;
  sub_reason?: string;
  special_condition?: string;
  status: 'waiting' | 'attending' | 'completed' | 'abandoned';
  customer_name?: string;
  customer_cedula?: string;
  customer_email?: string;
  created_at: string;
  called_at?: string;
  completed_at?: string;
  agent_id?: number;
  window_number?: number;
  estimated_wait?: number;
}

export interface CreateTurnRequest {
  branch_id: number;
  turn_type: 'normal' | 'preferential';
  reason: string;
  sub_reason?: string;
  special_condition?: string;
  customer_name?: string;
  customer_cedula?: string;
  customer_email?: string;
}

export interface UpdateTurnRequest {
  status: 'attending' | 'completed' | 'abandoned';
  agent_id?: number;
}