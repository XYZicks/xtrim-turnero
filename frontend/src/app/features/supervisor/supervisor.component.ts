import { Component, OnInit } from '@angular/core';
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
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';
import { Store } from '@ngrx/store';
import { Observable, interval } from 'rxjs';
import { startWith } from 'rxjs/operators';

import { getQueue } from '../../store/turns/turns.actions';
import { getAgents } from '../../store/agents/agents.actions';
import { selectQueue, selectTurnsLoading } from '../../store/turns/turns.selectors';
import { selectAllAgents, selectAgentsLoading } from '../../store/agents/agents.selectors';
import { Queue, QueueItem } from '../../core/models/queue.model';
import { Agent } from '../../core/models/agent.model';

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
  `]
})
export class SupervisorComponent implements OnInit {
  queue$: Observable<Queue | null>;
  agents$: Observable<Agent[]>;
  turnsLoading$: Observable<boolean>;
  agentsLoading$: Observable<boolean>;
  
  // Mock branch ID for demo purposes
  branchId: number = 1;
  
  constructor(
    private store: Store,
    private snackBar: MatSnackBar
  ) {
    this.queue$ = this.store.select(selectQueue);
    this.agents$ = this.store.select(selectAllAgents);
    this.turnsLoading$ = this.store.select(selectTurnsLoading);
    this.agentsLoading$ = this.store.select(selectAgentsLoading);
  }
  
  ngOnInit(): void {
    this.refreshData();
    
    // Auto-refresh data every 10 seconds
    interval(10000).pipe(
      startWith(0)
    ).subscribe(() => {
      this.refreshData();
    });
  }
  
  refreshData(): void {
    this.store.dispatch(getQueue({ branchId: this.branchId }));
    this.store.dispatch(getAgents({ branchId: this.branchId }));
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