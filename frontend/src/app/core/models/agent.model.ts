export interface Agent {
  id: number;
  name: string;
  email: string;
  branch_id: number;
  status: 'disponible' | 'no_disponible';
  unavailability_reason?: 'almuerzo' | 'break' | 'consulta_jefe' | 'otro';
  last_status_change: string;
  created_at: string;
}

export interface CreateAgentRequest {
  name: string;
  email: string;
  branch_id: number;
}

export interface UpdateAgentStatusRequest {
  status: 'disponible' | 'no_disponible';
  unavailability_reason?: 'almuerzo' | 'break' | 'consulta_jefe' | 'otro';
}