import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule
  ],
  template: `
    <mat-toolbar color="primary" class="bg-xtrim-purple">
      <div class="container mx-auto px-4 flex justify-between items-center w-full">
        <div class="flex items-center">
          <a routerLink="/" class="flex items-center text-white no-underline">
            <img src="assets/xtrim-logo.png" alt="Xtrim Logo" class="h-8 mr-2">
            <span class="text-xl font-medium">Turnero</span>
          </a>
        </div>
        
        <div class="flex gap-2 items-center">
          <!-- Siempre visible para todos los usuarios -->
          <a mat-button routerLink="/booking" class="text-white">Reservar Turno</a>
          
          <!-- Solo visible para usuarios autenticados -->
          <ng-container *ngIf="authService.isLoggedIn">
            <a mat-button routerLink="/agent" class="text-white">Agente</a>
            
            <!-- Solo visible para supervisores -->
            <ng-container *ngIf="authService.isSupervisor()">
              <a mat-button routerLink="/supervisor" class="text-white">Supervisor</a>
              <a mat-button routerLink="/reports" class="text-white">Reportes</a>
            </ng-container>
            
            <!-- Menú de usuario -->
            <button mat-button [matMenuTriggerFor]="userMenu" class="text-white">
              <mat-icon>account_circle</mat-icon>
              {{ authService.currentUser?.name }}
            </button>
            <mat-menu #userMenu="matMenu">
              <button mat-menu-item disabled>
                <mat-icon>badge</mat-icon>
                <span>{{ authService.currentUser?.role }}</span>
              </button>
              <button mat-menu-item (click)="logout()">
                <mat-icon>exit_to_app</mat-icon>
                <span>Cerrar sesión</span>
              </button>
            </mat-menu>
          </ng-container>
          
          <!-- Solo visible para usuarios no autenticados -->
          <a *ngIf="!authService.isLoggedIn" mat-button routerLink="/login" class="text-white">
            <mat-icon>login</mat-icon>
            Iniciar sesión
          </a>
        </div>
      </div>
    </mat-toolbar>
  `,
  styles: [`
    @media (max-width: 768px) {
      mat-toolbar > div {
        flex-direction: column;
        padding: 8px 0;
      }
      
      mat-toolbar > div > div:last-child {
        margin-top: 8px;
        flex-wrap: wrap;
        justify-content: center;
      }
    }
  `]
})
export class HeaderComponent implements OnInit {
  constructor(public authService: AuthService) {}
  
  ngOnInit(): void {}
  
  logout(): void {
    this.authService.logout();
  }
}