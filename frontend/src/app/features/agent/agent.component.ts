import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Observable, interval } from 'rxjs';
import { startWith } from 'rxjs/operators';

import { getAgents, updateAgentStatus } from '../../store/agents/agents.actions';
import { getQueue, updateTurn } from '../../store/turns/turns.actions';
import { selectCurrentAgent, selectAgentsLoading } from '../../store/agents/agents.selectors';
import { selectQueue, selectTurnsLoading } from '../../store/turns/turns.selectors';
import { Agent } from '../../core/models/agent.model';
import { Queue, QueueItem } from '../../core/models/queue.model';

@Component({
  selector: 'app-agent',
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
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  template: `
    <div class="container">
      <h1 class="page-title">Consola de Agente</h1>
      
      <div class="agent-container">
        <mat-card class="status-card">
          <mat-card-header>
            <mat-card-title>Estado del Agente</mat-card-title>
          </mat-card-header>
          
          <mat-card-content>
            <div *ngIf="currentAgent$ | async as agent" class="agent-status">
              <div class="status-indicator" [ngClass]="agent.status"></div>
              <div class="status-text">
                {{ agent.status === 'disponible' ? 'Disponible' : 'No Disponible' }}
                <span *ngIf="agent.unavailability_reason" class="reason">
                  ({{ getReasonText(agent.unavailability_reason) }})
                </span>
              </div>
            </div>
            
            <form [formGroup]="statusForm" (ngSubmit)="updateStatus()" class="status-form">
              <mat-form-field class="full-width">
                <mat-label>Cambiar Estado</mat-label>
                <mat-select formControlName="status">
                  <mat-option value="disponible">Disponible</mat-option>
                  <mat-option value="no_disponible">No Disponible</mat-option>
                </mat-select>
              </mat-form-field>
              
              <mat-form-field class="full-width" *ngIf="statusForm.get('status')?.value === 'no_disponible'">
                <mat-label>Motivo</mat-label>
                <mat-select formControlName="unavailability_reason">
                  <mat-option value="almuerzo">Almuerzo</mat-option>
                  <mat-option value="break">Break</mat-option>
                  <mat-option value="consulta_jefe">Consulta con Jefe</mat-option>
                  <mat-option value="otro">Otro</mat-option>
                </mat-select>
              </mat-form-field>
              
              <button mat-raised-button color="primary" type="submit" [disabled]="statusForm.invalid || (agentsLoading$ | async)">
                Actualizar Estado
              </button>
            </form>
          </mat-card-content>
        </mat-card>
        
        <mat-card class="queue-card">
          <mat-card-header>
            <mat-card-title>Próximo Turno</mat-card-title>
          </mat-card-header>
          
          <mat-card-content>
            <div *ngIf="turnsLoading$ | async" class="loading-container">
              <mat-spinner diameter="40"></mat-spinner>
            </div>
            
            <div *ngIf="nextTurn" class="next-turn">
              <div class="turn-header">
                <div class="ticket-number">{{ nextTurn.ticket_number }}</div>
                <div class="turn-type" [ngClass]="{'preferential': nextTurn.turn_type === 'preferential'}">
                  {{ nextTurn.turn_type === 'normal' ? 'Normal' : 'Preferencial' }}
                </div>
              </div>
              
              <div class="turn-details">
                <div class="detail-row">
                  <span class="label">Motivo:</span>
                  <span class="value">{{ nextTurn.reason }}</span>
                </div>
                
                <div class="detail-row">
                  <span class="label">Tiempo de espera:</span>
                  <span class="value">{{ nextTurn.wait_time }} minutos</span>
                </div>
              </div>
              
              <div class="turn-actions">
                <button mat-raised-button color="primary" (click)="attendTurn(nextTurn)">
                  <mat-icon>person</mat-icon> Atender
                </button>
                <button mat-raised-button color="warn" (click)="abandonTurn(nextTurn)">
                  <mat-icon>close</mat-icon> Abandono
                </button>
              </div>
            </div>
            
            <div *ngIf="!nextTurn && !(turnsLoading$ | async)" class="no-turns">
              <mat-icon>hourglass_empty</mat-icon>
              <p>No hay turnos en espera</p>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
      
      <mat-card class="queue-list-card">
        <mat-card-header>
          <mat-card-title>Cola de Espera</mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <div *ngIf="(queue$ | async)?.queue as queueItems">
            <div *ngIf="queueItems.length === 0" class="empty-queue">
              No hay turnos en espera
            </div>
            
            <div class="queue-table" *ngIf="queueItems.length > 0">
              <div class="queue-header">
                <div class="col">Ticket</div>
                <div class="col">Tipo</div>
                <div class="col">Motivo</div>
                <div class="col">Espera</div>
              </div>
              
              <div class="queue-row" *ngFor="let item of queueItems">
                <div class="col">{{ item.ticket_number }}</div>
                <div class="col" [ngClass]="{'preferential': item.turn_type === 'preferential'}">
                  {{ item.turn_type === 'normal' ? 'Normal' : 'Preferencial' }}
                </div>
                <div class="col">{{ item.reason }}</div>
                <div class="col">{{ item.wait_time }} min</div>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .agent-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 16px;
    }
    
    .status-card, .queue-card {
      height: 100%;
    }
    
    .agent-status {
      display: flex;
      align-items: center;
      margin-bottom: 16px;
    }
    
    .status-indicator {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      margin-right: 8px;
    }
    
    .status-indicator.disponible {
      background-color: #4caf50;
    }
    
    .status-indicator.no_disponible {
      background-color: #f44336;
    }
    
    .status-text {
      font-size: 18px;
      font-weight: 500;
    }
    
    .reason {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.6);
    }
    
    .status-form {
      margin-top: 16px;
    }
    
    .next-turn {
      padding: 16px;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
    }
    
    .turn-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    
    .ticket-number {
      font-size: 24px;
      font-weight: 500;
    }
    
    .turn-type {
      padding: 4px 8px;
      border-radius: 4px;
      background-color: #e0e0e0;
    }
    
    .turn-type.preferential {
      background-color: #E30613;
      color: white;
    }
    
    .turn-details {
      margin-bottom: 16px;
    }
    
    .detail-row {
      display: flex;
      margin-bottom: 8px;
    }
    
    .label {
      font-weight: 500;
      min-width: 120px;
    }
    
    .turn-actions {
      display: flex;
      justify-content: space-between;
    }
    
    .no-turns {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 32px 16px;
      color: rgba(0, 0, 0, 0.6);
    }
    
    .no-turns mat-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      margin-bottom: 16px;
    }
    
    .queue-table {
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
    }
    
    .queue-header {
      display: flex;
      background-color: #f5f5f5;
      font-weight: 500;
      padding: 8px;
    }
    
    .queue-row {
      display: flex;
      border-top: 1px solid #e0e0e0;
      padding: 8px;
    }
    
    .col {
      flex: 1;
    }
    
    .col.preferential {
      color: #E30613;
      font-weight: 500;
    }
    
    .empty-queue {
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
      .agent-container {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AgentComponent implements OnInit {
  statusForm: FormGroup;
  currentAgent$: Observable<Agent | null>;
  queue$: Observable<Queue | null>;
  agentsLoading$: Observable<boolean>;
  turnsLoading$: Observable<boolean>;
  nextTurn: QueueItem | null = null;
  
  // Mock agent ID for demo purposes
  agentId: number = 1;
  branchId: number = 1;
  
  constructor(
    private fb: FormBuilder,
    private store: Store,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.statusForm = this.fb.group({
      status: ['disponible', Validators.required],
      unavailability_reason: ['']
    });
    
    this.currentAgent$ = this.store.select(selectCurrentAgent);
    this.queue$ = this.store.select(selectQueue);
    this.agentsLoading$ = this.store.select(selectAgentsLoading);
    this.turnsLoading$ = this.store.select(selectTurnsLoading);
  }
  
  ngOnInit(): void {
    // Load agent data
    this.store.dispatch(getAgents({ branchId: this.branchId }));
    
    // Load queue data
    this.refreshQueue();
    
    // Auto-refresh queue every 10 seconds
    interval(10000).pipe(
      startWith(0)
    ).subscribe(() => {
      this.refreshQueue();
    });
    
    // Update validators when status changes
    this.statusForm.get('status')?.valueChanges.subscribe(value => {
      const reasonControl = this.statusForm.get('unavailability_reason');
      
      if (value === 'no_disponible') {
        reasonControl?.setValidators([Validators.required]);
      } else {
        reasonControl?.clearValidators();
      }
      
      reasonControl?.updateValueAndValidity();
    });
    
    // Update next turn when queue changes
    this.queue$.subscribe(queue => {
      if (queue && queue.queue.length > 0) {
        this.nextTurn = queue.queue[0];
      } else {
        this.nextTurn = null;
      }
    });
  }
  
  refreshQueue(): void {
    this.store.dispatch(getQueue({ branchId: this.branchId }));
  }
  
  updateStatus(): void {
    if (this.statusForm.valid) {
      const status = this.statusForm.value;
      
      this.store.dispatch(updateAgentStatus({
        id: this.agentId,
        update: {
          status: status.status,
          unavailability_reason: status.status === 'no_disponible' ? status.unavailability_reason : undefined
        }
      }));
      
      this.snackBar.open('Estado actualizado', 'Cerrar', {
        duration: 3000
      });
    }
  }
  
  attendTurn(turn: QueueItem): void {
    this.store.dispatch(updateTurn({
      id: turn.id,
      update: {
        status: 'attending',
        agent_id: this.agentId
      }
    }));
    
    this.snackBar.open(`Atendiendo turno ${turn.ticket_number}`, 'Cerrar', {
      duration: 3000
    });
    
    this.refreshQueue();
  }
  
  abandonTurn(turn: QueueItem): void {
    this.store.dispatch(updateTurn({
      id: turn.id,
      update: {
        status: 'abandoned',
        agent_id: this.agentId
      }
    }));
    
    this.snackBar.open(`Turno ${turn.ticket_number} marcado como abandonado`, 'Cerrar', {
      duration: 3000
    });
    
    this.refreshQueue();
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