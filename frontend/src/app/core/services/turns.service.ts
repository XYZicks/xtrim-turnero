import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Turn, CreateTurnRequest, UpdateTurnRequest } from '../models/turn.model';
import { Queue } from '../models/queue.model';

@Injectable({
  providedIn: 'root'
})
export class TurnsService {
  private apiUrl = `${environment.apiUrl}/turns`;
  private queueUrl = `${environment.apiUrl}/queue`;

  constructor(private http: HttpClient) { }

  createTurn(turn: CreateTurnRequest): Observable<Turn> {
    return this.http.post<Turn>(this.apiUrl, turn);
  }

  getTurn(id: number): Observable<Turn> {
    return this.http.get<Turn>(`${this.apiUrl}/${id}`);
  }

  updateTurn(id: number, update: UpdateTurnRequest): Observable<Turn> {
    return this.http.patch<Turn>(`${this.apiUrl}/${id}`, update);
  }

  getQueue(branchId: number): Observable<Queue> {
    return this.http.get<Queue>(`${this.queueUrl}/${branchId}`);
  }

  getAgentHistory(agentId: number): Observable<Turn[]> {
    return this.http.get<Turn[]>(`${this.apiUrl}/history/agent/${agentId}`);
  }

  getBranchHistory(branchId: number): Observable<Turn[]> {
    return this.http.get<Turn[]>(`${this.apiUrl}/history/branch/${branchId}`);
  }

  getAgentCurrentTurn(agentId: number): Observable<Turn> {
    return this.http.get<Turn>(`${this.apiUrl}/current/agent/${agentId}`);
  }

  getCalledTurns(): Observable<Turn[]> {
    return this.http.get<Turn[]>(`${this.apiUrl}/called`);
  }

  callNextTurn(agentId: number): Observable<Turn> {
    return this.http.post<Turn>(`${this.apiUrl}/call-next`, { agent_id: agentId });
  }
}