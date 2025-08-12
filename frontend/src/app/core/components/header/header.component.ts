import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenav } from '@angular/material/sidenav';
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
    <mat-toolbar color="primary" class="bg-xtrim-purple header-toolbar">
      <div class="header-container">
        <!-- Logo y título -->
        <div class="logo-section">
          <a routerLink="/" class="logo-link">
            <img src="assets/xtrim-logo.png" alt="Xtrim Logo" class="logo">
            <span class="title">Turnero</span>
          </a>
        </div>
        
        <!-- Menú desktop -->
        <div class="desktop-menu">
          <a mat-button routerLink="/booking" class="text-white">Reservar Turno</a>
          
          <ng-container *ngIf="authService.isLoggedIn">
            <a mat-button routerLink="/agent" class="text-white">Agente</a>
            
            <ng-container *ngIf="authService.isSupervisor()">
              <a mat-button routerLink="/supervisor" class="text-white">Supervisor</a>
              <a mat-button routerLink="/reports" class="text-white">Reportes</a>
            </ng-container>
            
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
          
          <a *ngIf="!authService.isLoggedIn" mat-button routerLink="/login" class="text-white">
            <mat-icon>login</mat-icon>
            Iniciar sesión
          </a>
        </div>
        
        <!-- Menú hamburguesa mobile -->
        <div class="mobile-menu">
          <button mat-icon-button (click)="toggleSidenav()" class="text-white">
            <mat-icon>menu</mat-icon>
          </button>
        </div>
      </div>
    </mat-toolbar>
  `,
  styles: [`
    .header-toolbar {
      font-family: 'Ubuntu', sans-serif !important;
      width: 100%;
      position: sticky;
      top: 0;
      z-index: 1000;
    }
    
    .header-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      padding: 0 16px;
    }
    
    .logo-section {
      display: flex;
      align-items: center;
    }
    
    .logo-link {
      display: flex;
      align-items: center;
      text-decoration: none;
      color: white;
    }
    
    .logo {
      height: 32px;
      margin-right: 8px;
    }
    
    .title {
      font-size: 1.25rem;
      font-weight: 500;
    }
    
    .desktop-menu {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    
    .mobile-menu {
      display: none;
    }
    

    
    @media (max-width: 768px) {
      .desktop-menu {
        display: none;
      }
      
      .mobile-menu {
        display: block;
      }
      
      .header-container {
        padding: 0 8px;
      }
      
      .title {
        font-size: 1.1rem;
      }
      
      .logo {
        height: 28px;
      }
    }
  `]
})
export class HeaderComponent implements OnInit {
  @Input() sidenav!: MatSidenav;
  
  constructor(public authService: AuthService) {}
  
  ngOnInit(): void {}
  
  toggleSidenav(): void {
    if (this.sidenav) {
      this.sidenav.toggle();
    }
  }
  
  logout(): void {
    this.authService.logout();
  }
}