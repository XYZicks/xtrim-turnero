import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-access-denied',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    RouterModule
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full">
        <mat-card class="p-8 bg-white shadow-md rounded-lg text-center">
          <mat-icon class="text-red-500 text-6xl mb-4">block</mat-icon>
          
          <h1 class="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h1>
          
          <p class="text-gray-600 mb-6">
            No tienes permisos para acceder a esta página. Esta sección está reservada para usuarios con rol de Supervisor.
          </p>
          
          <div class="flex flex-col space-y-4">
            <button 
              mat-raised-button 
              color="primary" 
              routerLink="/agent" 
              class="bg-xtrim-purple text-white">
              Ir a la página de Agente
            </button>
            
            <button 
              mat-stroked-button 
              (click)="logout()" 
              class="border-xtrim-purple text-xtrim-purple">
              Cerrar sesión
            </button>
          </div>
        </mat-card>
      </div>
    </div>
  `,
  styles: []
})
export class AccessDeniedComponent {
  constructor(private authService: AuthService) {}
  
  logout(): void {
    this.authService.logout();
  }
}