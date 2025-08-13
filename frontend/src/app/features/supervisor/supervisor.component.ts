import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';
import { Store } from '@ngrx/store';
import { Observable, interval, Subscription } from 'rxjs';

import { getQueue } from '../../store/turns/turns.actions';
import { getAgents } from '../../store/agents/agents.actions';
import { selectQueue, selectTurnsLoading } from '../../store/turns/turns.selectors';
import { selectAllAgents, selectAgentsLoading } from '../../store/agents/agents.selectors';
import { Queue, QueueItem } from '../../core/models/queue.model';
import { Agent } from '../../core/models/agent.model';
import { TurnsService } from '../../core/services/turns.service';

@Component({
  selector: 'app-supervisor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    DragDropModule
  ],
  template: `
    <div class="container">
      <h1 class="page-title">Panel de Supervisor</h1>
      
      <div class="dashboard-grid">
        <mat-card class="queue-card">
          <mat-card-header>
            <mat-card-title>Cola de Espera</mat-card-title>
            <div class="header-actions">
              <button mat-icon-button color="primary" (click)="refreshData()">
                <mat-icon>refresh</mat-icon>
              </button>
            </div>
          </mat-card-header>
          
          <mat-card-content>
            <div *ngIf="turnsLoading$ | async" class="loading-container">
              <mat-spinner diameter="40"></mat-spinner>
            </div>
            
            <div *ngIf="(queue$ | async) as queue">
              <div class="queue-stats">
                <div class="stat-item">
                  <div class="stat-value">{{ queue.waiting_count }}</div>
                  <div class="stat-label">En espera</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ queue.attending_count }}</div>
                  <div class="stat-label">En atención</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ queue.preferential_waiting }}</div>
                  <div class="stat-label">Preferenciales</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ queue.normal_waiting }}</div>
                  <div class="stat-label">Normales</div>
                </div>
              </div>
              
              <div cdkDropList class="queue-list" (cdkDropListDropped)="drop($event)">
                <div class="queue-item" *ngFor="let item of queue.queue" cdkDrag>
                  <div class="drag-handle" cdkDragHandle>
                    <mat-icon>drag_indicator</mat-icon>
                  </div>
                  <div class="ticket-info">
                    <div class="ticket-number">{{ item.ticket_number }}</div>
                    <div class="turn-type" [ngClass]="{'preferential': item.turn_type === 'preferential'}">
                      {{ item.turn_type === 'normal' ? 'Normal' : 'Preferencial' }}
                    </div>
                  </div>
                  <div class="turn-reason">
                    {{ item.reason }}
                  </div>
                  <div class="wait-time">
                    {{ item.wait_time }} min
                  </div>
                </div>
                
                <div *ngIf="queue.queue.length === 0" class="empty-queue">
                  No hay turnos en espera
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
        
        <mat-card class="agents-card">
          <mat-card-header>
            <mat-card-title>Agentes</mat-card-title>
          </mat-card-header>
          
          <mat-card-content>
            <div *ngIf="agentsLoading$ | async" class="loading-container">
              <mat-spinner diameter="40"></mat-spinner>
            </div>
            
            <div *ngIf="(agents$ | async) as agents">
              <div class="agents-list">
                <div class="agent-item" *ngFor="let agent of agents">
                  <div class="agent-status" [ngClass]="agent.status"></div>
                  <div class="agent-info">
                    <div class="agent-name">{{ agent.name }}</div>
                    <div class="agent-email">{{ agent.email }}</div>
                  </div>
                  <div class="agent-availability">
                    {{ agent.status === 'disponible' ? 'Disponible' : 'No Disponible' }}
                    <div *ngIf="agent.unavailability_reason" class="unavailability-reason">
                      {{ getReasonText(agent.unavailability_reason) }}
                    </div>
                    <div class="agent-module">
                      Módulo: {{ agent.assigned_module || 'N/A' }}
                    </div>
                  </div>
                  <div class="agent-actions">
                    <button mat-icon-button color="primary" (click)="assignModule(agent)" 
                            [title]="'Asignar módulo'">
                      <mat-icon>assignment</mat-icon>
                    </button>
                  </div>
                </div>
                
                <div *ngIf="agents.length === 0" class="empty-agents">
                  No hay agentes registrados
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
      
      <mat-card class="history-card">
        <mat-card-header>
          <mat-card-title>Historial del Día</mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <div *ngIf="branchHistory.length === 0" class="no-history">
            No se han completado turnos hoy
          </div>
          
          <div class="history-table" *ngIf="branchHistory.length > 0">
            <div class="history-header">
              <div class="col">Ticket</div>
              <div class="col">Cliente</div>
              <div class="col">Agente</div>
              <div class="col">Módulo</div>
              <div class="col">Estado</div>
              <div class="col">Hora</div>
            </div>
            
            <div class="history-row" *ngFor="let turn of branchHistory">
              <div class="col">{{ turn.ticket_number }}</div>
              <div class="col">{{ turn.customer_name || 'N/A' }}</div>
              <div class="col">{{ getAgentName(turn.agent_id) }}</div>
              <div class="col">{{ turn.assigned_module || 'N/A' }}</div>
              <div class="col">
                <span [ngClass]="{
                  'status-completed': turn.status === 'completed',
                  'status-abandoned': turn.status === 'abandoned'
                }">
                  {{ turn.status === 'completed' ? 'Completado' : 'Abandonado' }}
                </span>
              </div>
              <div class="col">{{ turn.called_at | date:'HH:mm' }}</div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .dashboard-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 16px;
    }
    
    .header-actions {
      margin-left: auto;
    }
    
    .queue-stats {
      display: flex;
      justify-content: space-between;
      margin-bottom: 16px;
      background-color: #f5f5f5;
      border-radius: 4px;
      padding: 16px;
    }
    
    .stat-item {
      text-align: center;
    }
    
    .stat-value {
      font-size: 24px;
      font-weight: 500;
      color: #E30613;
    }
    
    .stat-label {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.6);
    }
    
    .queue-list {
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
    }
    
    .queue-item {
      display: flex;
      align-items: center;
      padding: 8px;
      border-bottom: 1px solid #e0e0e0;
      background-color: white;
    }
    
    .queue-item:last-child {
      border-bottom: none;
    }
    
    .drag-handle {
      cursor: move;
      color: rgba(0, 0, 0, 0.3);
      margin-right: 8px;
    }
    
    .ticket-info {
      display: flex;
      flex-direction: column;
      min-width: 100px;
    }
    
    .ticket-number {
      font-weight: 500;
    }
    
    .turn-type {
      font-size: 12px;
      padding: 2px 4px;
      border-radius: 4px;
      background-color: #e0e0e0;
      display: inline-block;
    }
    
    .turn-type.preferential {
      background-color: #E30613;
      color: white;
    }
    
    .turn-reason {
      flex: 1;
      padding: 0 8px;
    }
    
    .wait-time {
      font-weight: 500;
      color: #4D4D4F;
    }
    
    .empty-queue {
      padding: 16px;
      text-align: center;
      color: rgba(0, 0, 0, 0.6);
    }
    
    .agents-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .agent-item {
      display: flex;
      align-items: center;
      padding: 8px;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      gap: 8px;
    }
    
    .agent-status {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      margin-right: 8px;
    }
    
    .agent-status.disponible {
      background-color: #4caf50;
    }
    
    .agent-status.no_disponible {
      background-color: #f44336;
    }
    
    .agent-info {
      flex: 1;
    }
    
    .agent-name {
      font-weight: 500;
    }
    
    .agent-email {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.6);
    }
    
    .agent-availability {
      text-align: right;
      font-size: 14px;
    }
    
    .unavailability-reason {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.6);
    }
    
    .agent-module {
      font-size: 12px;
      color: #3F1B6A;
      font-weight: 500;
    }
    
    .agent-actions {
      display: flex;
      gap: 4px;
    }
    
    .empty-agents {
      padding: 16px;
      text-align: center;
      color: rgba(0, 0, 0, 0.6);
    }
    
    .loading-container {
      display: flex;
      justify-content: center;
      padding: 32px;
    }
    
    @media (max-width: 768px) {
      .dashboard-grid {
        grid-template-columns: 1fr;
      }
    }
    
    .cdk-drag-preview {
      box-sizing: border-box;
      border-radius: 4px;
      box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2),
                  0 8px 10px 1px rgba(0, 0, 0, 0.14),
                  0 3px 14px 2px rgba(0, 0, 0, 0.12);
    }
    
    .cdk-drag-placeholder {
      opacity: 0;
    }
    
    .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
    
    .queue-list.cdk-drop-list-dragging .queue-item:not(.cdk-drag-placeholder) {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
    
    .history-card {
      margin-top: 16px;
      grid-column: 1 / -1;
    }
    
    .history-table {
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
    }
    
    .history-header {
      display: flex;
      background-color: #f5f5f5;
      font-weight: 500;
      padding: 8px;
    }
    
    .history-row {
      display: flex;
      border-top: 1px solid #e0e0e0;
      padding: 8px;
    }
    
    .history-table .col {
      flex: 1;
      min-width: 80px;
    }
    
    .status-completed {
      color: #4caf50;
      font-weight: 500;
    }
    
    .status-abandoned {
      color: #f44336;
      font-weight: 500;
    }
    
    .no-history {
      padding: 16px;
      text-align: center;
      color: rgba(0, 0, 0, 0.6);
    }
  `]
})
export class SupervisorComponent implements OnInit, OnDestroy {
  queue$: Observable<Queue | null>;
  agents$: Observable<Agent[]>;
  turnsLoading$: Observable<boolean>;
  agentsLoading$: Observable<boolean>;
  private refreshSubscription?: Subscription;
  branchHistory: any[] = [];
  
  // Mock branch ID for demo purposes
  branchId: number = 1;
  
  constructor(
    private store: Store,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private turnsService: TurnsService
  ) {
    this.queue$ = this.store.select(selectQueue);
    this.agents$ = this.store.select(selectAllAgents);
    this.turnsLoading$ = this.store.select(selectTurnsLoading);
    this.agentsLoading$ = this.store.select(selectAgentsLoading);
  }
  
  ngOnInit(): void {
    console.log('Supervisor: Component initialized');
    
    // Subscribe to queue changes for debugging
    this.queue$.subscribe(queue => {
      console.log('Supervisor: Queue data updated', queue);
    });
    
    // Subscribe to agents changes for debugging
    this.agents$.subscribe(agents => {
      console.log('Supervisor: Agents data updated', agents);
      this.agentsList = agents; // Guardar la lista para usar en getAgentName
    });
    
    // Initial data load
    this.refreshData();
    this.loadBranchHistory();
    
    // Auto-refresh data every 5 seconds
    this.refreshSubscription = interval(5000).subscribe(() => {
      this.refreshData();
    });
  }
  
  ngOnDestroy(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }
  
  refreshData(): void {
    console.log('Supervisor: Refreshing data for branch', this.branchId);
    this.store.dispatch(getQueue({ branchId: this.branchId }));
    this.store.dispatch(getAgents({ branchId: this.branchId }));
    this.loadBranchHistory();
  }
  
  drop(event: CdkDragDrop<QueueItem[]>): void {
    // In a real application, this would update the queue order in the backend
    // For now, we'll just show a notification
    this.snackBar.open('Orden de cola actualizado', 'Cerrar', {
      duration: 3000
    });
    
    // For demo purposes, we'll update the local queue order
    this.queue$.subscribe(queue => {
      if (queue) {
        const items = [...queue.queue];
        moveItemInArray(items, event.previousIndex, event.currentIndex);
        // In a real app, you would dispatch an action to update the queue order in the backend
      }
    });
  }
  
  assignModule(agent: Agent): void {
    const module = prompt(`Asignar módulo al agente ${agent.name}:`, agent.assigned_module || '');
    
    if (module !== null) {
      // TODO: Implementar acción NgRx para asignar módulo
      console.log(`Assigning module '${module}' to agent ${agent.id}`);
      
      this.snackBar.open(
        module ? `Módulo '${module}' asignado a ${agent.name}` : `Módulo removido de ${agent.name}`,
        'Cerrar',
        { duration: 3000 }
      );
    }
  }
  
  loadBranchHistory(): void {
    this.turnsService.getBranchHistory(this.branchId).subscribe({
      next: (history: any[]) => {
        this.branchHistory = history;
      },
      error: (error: any) => {
        console.error('Error loading branch history', error);
      }
    });
  }
  
  private agentsList: Agent[] = [];
  
  getAgentName(agentId: number): string {
    const agent = this.agentsList.find(a => a.id === agentId);
    return agent ? agent.name : 'N/A';
  }
  
  getReasonText(reason: string): string {
    switch (reason) {
      case 'almuerzo': return 'Almuerzo';
      case 'break': return 'Break';
      case 'consulta_jefe': return 'Consulta con Jefe';
      case 'otro': return 'Otro';
      default: return reason;
    }
  }
}