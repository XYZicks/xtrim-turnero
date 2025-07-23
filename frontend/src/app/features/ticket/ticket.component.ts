import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { Store } from '@ngrx/store';
import { Observable, interval } from 'rxjs';
import { switchMap, startWith } from 'rxjs/operators';

import { getTurn } from '../../store/turns/turns.actions';
import { selectCurrentTurn, selectTurnsLoading, selectTurnsError } from '../../store/turns/turns.selectors';
import { Turn } from '../../core/models/turn.model';

@Component({
  selector: 'app-ticket',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule
  ],
  template: `
    <div class="container">
      <div *ngIf="loading$ | async" class="loading-container">
        <mat-spinner></mat-spinner>
      </div>
      
      <div *ngIf="error$ | async as error" class="error-container">
        <mat-card>
          <mat-card-content>
            <h2>Error al cargar el turno</h2>
            <p>{{ error.message }}</p>
          </mat-card-content>
        </mat-card>
      </div>
      
      <div *ngIf="turn$ | async as turn">
        <mat-card class="ticket-card">
          <mat-card-header>
            <div mat-card-avatar class="ticket-avatar">
              <mat-icon>confirmation_number</mat-icon>
            </div>
            <mat-card-title>Turno {{ turn.ticket_number }}</mat-card-title>
            <mat-card-subtitle>
              <span [ngClass]="{'preferential': turn.turn_type === 'preferential'}">
                {{ turn.turn_type === 'normal' ? 'Normal' : 'Preferencial' }}
              </span>
            </mat-card-subtitle>
          </mat-card-header>
          
          <mat-card-content>
            <div class="ticket-info">
              <div class="info-row">
                <span class="label">Estado:</span>
                <span class="value status" [ngClass]="turn.status">
                  {{ getStatusText(turn.status) }}
                </span>
              </div>
              
              <div class="info-row">
                <span class="label">Motivo:</span>
                <span class="value">{{ turn.reason }}</span>
              </div>
              
              <div class="info-row" *ngIf="turn.customer_name">
                <span class="label">Cliente:</span>
                <span class="value">{{ turn.customer_name }}</span>
              </div>
              
              <mat-divider class="my-3"></mat-divider>
              
              <div class="info-row">
                <span class="label">Creado:</span>
                <span class="value">{{ formatDate(turn.created_at) }}</span>
              </div>
              
              <div class="info-row" *ngIf="turn.status === 'waiting'">
                <span class="label">Tiempo estimado de espera:</span>
                <span class="value">{{ turn.estimated_wait }} minutos</span>
              </div>
              
              <div class="info-row" *ngIf="turn.called_at">
                <span class="label">Llamado:</span>
                <span class="value">{{ formatDate(turn.called_at) }}</span>
              </div>
              
              <div class="info-row" *ngIf="turn.completed_at">
                <span class="label">Completado:</span>
                <span class="value">{{ formatDate(turn.completed_at) }}</span>
              </div>
            </div>
          </mat-card-content>
          
          <mat-card-actions>
            <button mat-button color="primary" (click)="refreshTurn()">
              <mat-icon>refresh</mat-icon> Actualizar
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .ticket-card {
      max-width: 600px;
      margin: 0 auto;
    }
    
    .ticket-avatar {
      background-color: #E30613;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .ticket-info {
      padding: 16px 0;
    }
    
    .info-row {
      display: flex;
      margin-bottom: 8px;
    }
    
    .label {
      font-weight: 500;
      min-width: 180px;
    }
    
    .value {
      flex: 1;
    }
    
    .status {
      font-weight: 500;
    }
    
    .status.waiting {
      color: #ff9800;
    }
    
    .status.attending {
      color: #2196f3;
    }
    
    .status.completed {
      color: #4caf50;
    }
    
    .status.abandoned {
      color: #f44336;
    }
    
    .preferential {
      color: #E30613;
      font-weight: 500;
    }
    
    .my-3 {
      margin: 16px 0;
    }
    
    .loading-container {
      display: flex;
      justify-content: center;
      padding: 32px;
    }
    
    .error-container {
      max-width: 600px;
      margin: 0 auto;
    }
  `]
})
export class TicketComponent implements OnInit {
  turn$: Observable<Turn | null>;
  loading$: Observable<boolean>;
  error$: Observable<any>;
  turnId: number = 0;
  
  constructor(
    private route: ActivatedRoute,
    private store: Store
  ) {
    this.turn$ = this.store.select(selectCurrentTurn);
    this.loading$ = this.store.select(selectTurnsLoading);
    this.error$ = this.store.select(selectTurnsError);
  }
  
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.turnId = +params['id'];
      this.refreshTurn();
      
      // Auto-refresh every 30 seconds if turn is in waiting status
      this.turn$.pipe(
        switchMap(turn => {
          if (turn && turn.status === 'waiting') {
            return interval(30000).pipe(
              startWith(0)
            );
          }
          return interval(300000); // Less frequent updates for other statuses
        })
      ).subscribe(() => {
        this.refreshTurn();
      });
    });
  }
  
  refreshTurn(): void {
    this.store.dispatch(getTurn({ id: this.turnId }));
  }
  
  getStatusText(status: string): string {
    switch (status) {
      case 'waiting': return 'En espera';
      case 'attending': return 'En atención';
      case 'completed': return 'Completado';
      case 'abandoned': return 'Abandonado';
      default: return status;
    }
  }
  
  formatDate(dateString?: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  }
}