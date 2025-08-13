import { Turn } from './turn.model';

export interface QueueItem {
  id: number;
  ticket_number: string;
  turn_type: 'normal' | 'preferential';
  reason: string;
  status: 'waiting' | 'attending' | 'completed' | 'abandoned';
  customer_name?: string;
  created_at: string;
  wait_time: number;
}

export interface Queue {
  branch_id: number;
  waiting_count: number;
  attending_count: number;
  preferential_waiting: number;
  normal_waiting: number;
  queue: QueueItem[];
}