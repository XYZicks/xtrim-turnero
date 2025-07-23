import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Agent, CreateAgentRequest, UpdateAgentStatusRequest } from '../models/agent.model';

@Injectable({
  providedIn: 'root'
})
export class AgentsService {
  private apiUrl = `${environment.authApiUrl}/agent`;

  constructor(private http: HttpClient) { }

  createAgent(agent: CreateAgentRequest): Observable<Agent> {
    return this.http.post<Agent>(this.apiUrl, agent);
  }

  getAgent(id: number): Observable<Agent> {
    return this.http.get<Agent>(`${this.apiUrl}/${id}`);
  }

  getAgents(branchId?: number, status?: string): Observable<Agent[]> {
    let url = this.apiUrl;
    const params: any = {};
    
    if (branchId) {
      params.branch_id = branchId;
    }
    
    if (status) {
      params.status = status;
    }
    
    return this.http.get<Agent[]>(url, { params });
  }

  updateAgentStatus(id: number, update: UpdateAgentStatusRequest): Observable<Agent> {
    return this.http.patch<Agent>(`${this.apiUrl}/${id}/status`, update);
  }
}