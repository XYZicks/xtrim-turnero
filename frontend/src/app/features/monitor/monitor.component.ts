import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { TurnsService } from '../../core/services/turns.service';
import { Turn } from '../../core/models/turn.model';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-monitor',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule
  ],
  template: `
    <div class="monitor-container">
      <div class="header">
        <h1 class="title">TURNOS LLAMADOS</h1>
        <div class="current-time">{{ currentTime | date:'HH:mm:ss' }}</div>
      </div>
      
      <div class="turns-grid">
        <div *ngFor="let turn of calledTurns" class="turn-card" 
             [class.current]="turn.status === 'attending'"
             [class.completed]="turn.status === 'completed'">
          <div class="turn-number">{{ turn.ticket_number }}</div>
          <div class="turn-info">
            <div class="service">{{ getReasonText(turn.reason) }}</div>
            <div class="window">Ventanilla {{ turn.window_number || '1' }}</div>
          </div>
          <div class="status-icon">
            <mat-icon *ngIf="turn.status === 'attending'">person</mat-icon>
            <mat-icon *ngIf="turn.status === 'completed'">check_circle</mat-icon>
          </div>
        </div>
      </div>
      
      <div *ngIf="calledTurns.length === 0" class="no-turns">
        <mat-icon>schedule</mat-icon>
        <p>No hay turnos llamados en este momento</p>
      </div>
      
      <div class="history-section">
        <h2 class="history-title">TURNOS COMPLETADOS HOY</h2>
        <div class="history-grid">
          <div *ngFor="let turn of todayHistory" class="history-item">
            <div class="history-ticket">{{ turn.ticket_number }}</div>
            <div class="history-info">
              <div class="history-service">{{ getReasonText(turn.reason) }}</div>
              <div class="history-time">{{ turn.called_at | date:'HH:mm' }}</div>
            </div>
            <div class="history-module">{{ turn.assigned_module || 'N/A' }}</div>
          </div>
        </div>
        
        <div *ngIf="todayHistory.length === 0" class="no-history">
          <p>No se han completado turnos hoy</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .monitor-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #3F1B6A 0%, #5a2d91 100%);
      color: white;
      padding: 2rem;
      font-family: 'Ubuntu', sans-serif;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 3rem;
      border-bottom: 2px solid rgba(255,255,255,0.2);
      padding-bottom: 1rem;
    }
    
    .title {
      font-size: 3rem;
      font-weight: 700;
      margin: 0;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }
    
    .current-time {
      font-size: 2rem;
      font-weight: 500;
      background: rgba(255,255,255,0.1);
      padding: 0.5rem 1rem;
      border-radius: 10px;
    }
    
    .turns-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 2rem;
      margin-bottom: 2rem;
    }
    
    .turn-card {
      background: rgba(255,255,255,0.1);
      border-radius: 15px;
      padding: 2rem;
      display: flex;
      align-items: center;
      gap: 2rem;
      backdrop-filter: blur(10px);
      border: 2px solid rgba(255,255,255,0.2);
      transition: all 0.3s ease;
    }
    
    .turn-card.current {
      background: rgba(76, 175, 80, 0.2);
      border-color: #4CAF50;
      animation: pulse 2s infinite;
    }
    
    .turn-card.completed {
      background: rgba(255,255,255,0.05);
      opacity: 0.7;
    }
    
    .turn-number {
      font-size: 4rem;
      font-weight: 900;
      min-width: 120px;
      text-align: center;
      background: rgba(255,255,255,0.2);
      border-radius: 10px;
      padding: 1rem;
    }
    
    .turn-info {
      flex: 1;
    }
    
    .service {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }
    
    .window {
      font-size: 2rem;
      font-weight: 700;
      color: #FFD700;
    }
    
    .status-icon {
      font-size: 3rem;
    }
    
    .status-icon mat-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
    }
    
    .no-turns {
      text-align: center;
      padding: 4rem;
      opacity: 0.7;
    }
    
    .no-turns mat-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      margin-bottom: 1rem;
    }
    
    .no-turns p {
      font-size: 1.5rem;
      margin: 0;
    }
    
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.02); }
    }
    
    @media (max-width: 768px) {
      .turns-grid {
        grid-template-columns: 1fr;
      }
      
      .title {
        font-size: 2rem;
      }
      
      .current-time {
        font-size: 1.5rem;
      }
      
      .turn-number {
        font-size: 3rem;
        min-width: 100px;
      }
    }
    
    .history-section {
      margin-top: 3rem;
      border-top: 2px solid rgba(255,255,255,0.2);
      padding-top: 2rem;
    }
    
    .history-title {
      font-size: 2rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
      text-align: center;
      color: #FFD700;
    }
    
    .history-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1rem;
    }
    
    .history-item {
      background: rgba(255,255,255,0.05);
      border-radius: 10px;
      padding: 1rem;
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .history-ticket {
      font-size: 1.5rem;
      font-weight: 700;
      min-width: 80px;
      text-align: center;
      background: rgba(255,255,255,0.1);
      border-radius: 5px;
      padding: 0.5rem;
    }
    
    .history-info {
      flex: 1;
    }
    
    .history-service {
      font-size: 1rem;
      font-weight: 500;
    }
    
    .history-time {
      font-size: 0.9rem;
      opacity: 0.8;
    }
    
    .history-module {
      font-size: 1.2rem;
      font-weight: 600;
      color: #4CAF50;
    }
    
    .no-history {
      text-align: center;
      padding: 2rem;
      opacity: 0.6;
    }
    
    .no-history p {
      font-size: 1.2rem;
      margin: 0;
    }
  `]
})
export class MonitorComponent implements OnInit, OnDestroy {
  calledTurns: Turn[] = [];
  todayHistory: Turn[] = [];
  currentTime = new Date();
  private refreshSubscription?: Subscription;
  private timeSubscription?: Subscription;

  constructor(private turnsService: TurnsService) {}

  ngOnInit(): void {
    this.loadCalledTurns();
    this.loadTodayHistory();
    this.startPolling();
    this.startClock();
  }

  ngOnDestroy(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
    if (this.timeSubscription) {
      this.timeSubscription.unsubscribe();
    }
  }

  private loadCalledTurns(): void {
    this.turnsService.getCalledTurns().subscribe({
      next: (turns) => {
        this.calledTurns = turns.slice(0, 6); // Mostrar máximo 6 turnos
      },
      error: (error) => {
        console.error('Error loading called turns', error);
      }
    });
  }

  private loadTodayHistory(): void {
    this.turnsService.getBranchHistory(1).subscribe({
      next: (history: any[]) => {
        this.todayHistory = history.slice(0, 10); // Últimos 10 turnos
      },
      error: (error: any) => {
        console.error('Error loading today history', error);
      }
    });
  }

  private startPolling(): void {
    this.refreshSubscription = interval(3000).pipe(
      switchMap(() => this.turnsService.getCalledTurns())
    ).subscribe({
      next: (turns) => {
        this.calledTurns = turns.slice(0, 6);
      },
      error: (error) => {
        console.error('Error refreshing turns', error);
      }
    });
    
    // Refresh history every 30 seconds
    interval(30000).subscribe(() => {
      this.loadTodayHistory();
    });
  }

  private startClock(): void {
    this.timeSubscription = interval(1000).subscribe(() => {
      this.currentTime = new Date();
    });
  }

  getReasonText(reason: string): string {
    switch (reason) {
      case 'soporte_tecnico': return 'Soporte Técnico';
      case 'facturacion': return 'Facturación';
      case 'nuevos_servicios': return 'Nuevos Servicios';
      case 'reclamos': return 'Reclamos';
      case 'otro': return 'Otro';
      default: return reason || '';
    }
  }
}