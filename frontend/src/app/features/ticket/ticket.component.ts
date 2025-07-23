import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { TurnsService } from '../../core/services/turns.service';
import { Turn } from '../../core/models/turn.model';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-ticket',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule
  ],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-md mx-auto">
        <div class="bg-white rounded-lg shadow-lg overflow-hidden">
          <!-- Ticket Header -->
          <div class="bg-xtrim-purple text-white p-6 text-center">
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
            
            <div *ngIf="turn?.status === 'attending'" class="mt-6 p-4 bg-blue-50 rounded-lg">
              <div class="text-center text-blue-800">
                <mat-icon class="align-middle mr-2">person</mat-icon>
                <span>Su turno está siendo atendido</span>
              </div>
            </div>
            
            <div *ngIf="turn?.status === 'waiting'" class="mt-6 p-4 bg-yellow-50 rounded-lg">
              <div class="text-center text-yellow-800">
                <mat-icon class="align-middle mr-2">schedule</mat-icon>
                <span>Por favor espere a ser llamado</span>
              </div>
            </div>
            
            <div *ngIf="turn?.status === 'completed'" class="mt-6 p-4 bg-green-50 rounded-lg">
              <div class="text-center text-green-800">
                <mat-icon class="align-middle mr-2">check_circle</mat-icon>
                <span>Su turno ha sido completado</span>
              </div>
            </div>
            
            <div *ngIf="turn?.status === 'abandoned'" class="mt-6 p-4 bg-red-50 rounded-lg">
              <div class="text-center text-red-800">
                <mat-icon class="align-middle mr-2">error</mat-icon>
                <span>Su turno ha sido abandonado</span>
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
  styles: []
})
export class TicketComponent implements OnInit, OnDestroy {
  turn: Turn | null = null;
  private refreshSubscription?: Subscription;
  
  constructor(
    private route: ActivatedRoute,
    private turnsService: TurnsService
  ) {}
  
  ngOnInit(): void {
    const turnId = this.route.snapshot.paramMap.get('id');
    
    if (turnId) {
      // Initial load
      this.turnsService.getTurn(+turnId).subscribe({
        next: (turn) => {
          this.turn = turn;
        },
        error: (error) => {
          console.error('Error fetching turn', error);
        }
      });
      
      // Refresh every 30 seconds if turn is in waiting status
      this.refreshSubscription = interval(30000).pipe(
        switchMap(() => this.turnsService.getTurn(+turnId))
      ).subscribe({
        next: (turn) => {
          this.turn = turn;
          
          // Stop polling if turn is no longer waiting
          if (turn.status !== 'waiting' && this.refreshSubscription) {
            this.refreshSubscription.unsubscribe();
          }
        },
        error: (error) => {
          console.error('Error refreshing turn', error);
        }
      });
    }
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
}