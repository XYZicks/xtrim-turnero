import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TurnsService } from '../../core/services/turns.service';
import { Turn } from '../../core/models/turn.model';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-ticket',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-md mx-auto">
        <div class="bg-white rounded-lg xtrim-shadow overflow-hidden">
          <!-- Ticket Header -->
          <div class="bg-xtrim-purple text-white p-6 text-center relative">
            <div class="absolute top-2 right-2" *ngIf="turn?.status === 'waiting'">
              <div class="w-3 h-3 bg-green-400 rounded-full animate-pulse" title="Actualizando automáticamente"></div>
            </div>
            <h1 class="text-3xl font-bold mb-2">Turno</h1>
            <div class="text-5xl font-bold mb-2">{{ turn?.ticket_number }}</div>
            <p class="text-lg">
              {{ getTurnTypeText() }}
            </p>
          </div>
          
          <!-- Ticket Body -->
          <div class="p-6">
            <div class="flex items-center justify-between mb-4">
              <div class="text-gray-600">Estado:</div>
              <div class="font-semibold">
                <span [ngClass]="{
                  'bg-yellow-100 text-yellow-800': turn?.status === 'waiting',
                  'bg-blue-100 text-blue-800': turn?.status === 'attending',
                  'bg-green-100 text-green-800': turn?.status === 'completed',
                  'bg-red-100 text-red-800': turn?.status === 'abandoned'
                }" class="px-3 py-1 rounded-full text-sm">
                  {{ getStatusText() }}
                </span>
              </div>
            </div>
            
            <div class="flex items-center justify-between mb-4">
              <div class="text-gray-600">Motivo:</div>
              <div class="font-semibold">{{ getReasonText() }}</div>
            </div>
            
            <div class="flex items-center justify-between mb-4" *ngIf="turn?.status === 'waiting'">
              <div class="text-gray-600">Tiempo estimado:</div>
              <div class="font-semibold">{{ turn?.estimated_wait }} minutos</div>
            </div>
            
            <div class="flex items-center justify-between mb-4">
              <div class="text-gray-600">Fecha:</div>
              <div class="font-semibold">{{ turn?.created_at | date:'dd/MM/yyyy HH:mm' }}</div>
            </div>
            
            <div *ngIf="turn?.status === 'attending'" class="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
              <div class="text-center text-blue-800">
                <mat-icon class="align-middle mr-2 animate-pulse">person</mat-icon>
                <span class="font-semibold">¡Su turno está siendo atendido!</span>
                <div class="text-sm mt-1">Diríjase al mostrador correspondiente</div>
              </div>
            </div>
            
            <div *ngIf="turn?.status === 'waiting'" class="mt-6 p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
              <div class="text-center text-yellow-800">
                <mat-icon class="align-middle mr-2">schedule</mat-icon>
                <span>Por favor espere a ser llamado</span>
                <div class="text-sm mt-1">Su turno se actualiza automáticamente</div>
              </div>
            </div>
            
            <div *ngIf="turn?.status === 'completed'" class="mt-6 p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
              <div class="text-center text-green-800">
                <mat-icon class="align-middle mr-2">check_circle</mat-icon>
                <span class="font-semibold">Su turno ha sido completado</span>
                <div class="text-sm mt-1">Gracias por su visita</div>
              </div>
            </div>
            
            <div *ngIf="turn?.status === 'abandoned'" class="mt-6 p-4 bg-red-50 rounded-lg border-l-4 border-red-400">
              <div class="text-center text-red-800">
                <mat-icon class="align-middle mr-2">error</mat-icon>
                <span class="font-semibold">Su turno ha sido cancelado</span>
                <div class="text-sm mt-1">Puede solicitar un nuevo turno si lo desea</div>
              </div>
            </div>
          </div>
          
          <!-- Ticket Footer -->
          <div class="bg-gray-50 p-4 text-center">
            <p class="text-gray-500 text-sm">Gracias por elegir Xtrim</p>
          </div>
        </div>
        
        <div class="mt-6 text-center">
          <button mat-raised-button color="primary" routerLink="/booking" 
                  class="bg-xtrim-purple text-white px-6 py-2 rounded-md hover:bg-opacity-90 transition-all">
            Volver al inicio
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: .5;
      }
    }
    
    .bg-xtrim-purple {
      background-color: #402063;
    }
    
    .status-transition {
      transition: all 0.3s ease-in-out;
    }
    
    :host ::ng-deep .success-snackbar {
      background-color: #4caf50 !important;
      color: white !important;
    }
    
    :host ::ng-deep .error-snackbar {
      background-color: #f44336 !important;
      color: white !important;
    }
    
    :host ::ng-deep .success-snackbar .mat-simple-snackbar-action {
      color: white !important;
    }
    
    :host ::ng-deep .error-snackbar .mat-simple-snackbar-action {
      color: white !important;
    }
  `]
})
export class TicketComponent implements OnInit, OnDestroy {
  turn: Turn | null = null;
  private refreshSubscription?: Subscription;
  
  constructor(
    private route: ActivatedRoute,
    private turnsService: TurnsService,
    private snackBar: MatSnackBar
  ) {}
  
  ngOnInit(): void {
    const turnId = this.route.snapshot.paramMap.get('id');
    
    if (turnId) {
      console.log('Ticket: Component initialized for turn', turnId);
      this.loadTurnData(+turnId);
      this.startPolling(+turnId);
    }
  }
  
  private loadTurnData(turnId: number): void {
    this.turnsService.getTurn(turnId).subscribe({
      next: (turn) => {
        console.log('Ticket: Turn data loaded', turn);
        this.turn = turn;
      },
      error: (error) => {
        console.error('Ticket: Error fetching turn', error);
      }
    });
  }
  
  private startPolling(turnId: number): void {
    // Poll every 5 seconds for more responsive updates
    this.refreshSubscription = interval(5000).pipe(
      switchMap(() => this.turnsService.getTurn(turnId))
    ).subscribe({
      next: (turn) => {
        const previousStatus = this.turn?.status;
        this.turn = turn;
        
        // Show notification on status change
        if (previousStatus && previousStatus !== turn.status) {
          console.log(`Ticket: Status changed from ${previousStatus} to ${turn.status}`);
          this.showStatusChangeNotification(turn.status);
        }
        
        // Stop polling if turn is completed or abandoned
        if ((turn.status === 'completed' || turn.status === 'abandoned') && this.refreshSubscription) {
          console.log('Ticket: Stopping polling - turn is', turn.status);
          this.refreshSubscription.unsubscribe();
        }
      },
      error: (error) => {
        console.error('Ticket: Error refreshing turn', error);
      }
    });
  }
  
  ngOnDestroy(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }
  
  getTurnTypeText(): string {
    return this.turn?.turn_type === 'preferential' ? 'Turno Preferencial' : 'Turno Normal';
  }
  
  getStatusText(): string {
    switch (this.turn?.status) {
      case 'waiting': return 'En espera';
      case 'attending': return 'En atención';
      case 'completed': return 'Completado';
      case 'abandoned': return 'Abandonado';
      default: return '';
    }
  }
  
  getReasonText(): string {
    switch (this.turn?.reason) {
      case 'soporte_tecnico': return 'Soporte Técnico';
      case 'facturacion': return 'Facturación';
      case 'nuevos_servicios': return 'Nuevos Servicios';
      case 'reclamos': return 'Reclamos';
      case 'otro': return 'Otro';
      default: return this.turn?.reason || '';
    }
  }
  
  private showStatusChangeNotification(status: string): void {
    let message = '';
    let panelClass = '';
    
    switch (status) {
      case 'attending':
        message = '¡Su turno está siendo atendido! Diríjase al mostrador.';
        panelClass = 'success-snackbar';
        break;
      case 'completed':
        message = 'Su turno ha sido completado. ¡Gracias por su visita!';
        panelClass = 'success-snackbar';
        break;
      case 'abandoned':
        message = 'Su turno ha sido cancelado.';
        panelClass = 'error-snackbar';
        break;
    }
    
    if (message) {
      this.snackBar.open(message, 'Cerrar', {
        duration: 8000,
        panelClass: [panelClass],
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
    }
  }
}