import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { HeaderComponent } from './core/components/header/header.component';
import { FooterComponent } from './core/components/footer/footer.component';
import { AuthService } from './core/services/auth.service';
import { MatNavList } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';

import { selectDarkMode } from './store/ui/ui.selectors';
import { toggleDarkMode } from './store/ui/ui.actions';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatNavList,
    MatDividerModule,
    HeaderComponent,
    FooterComponent
  ],
  template: `
    <div [class.dark-theme]="darkMode$ | async" class="app-container">
      <mat-sidenav-container class="sidenav-container">
        <mat-sidenav #sidenav mode="over" class="mobile-sidenav">
          <div class="sidenav-content">
            <div class="sidenav-header">
              <img src="assets/xtrim-logo.png" alt="Xtrim Logo" class="sidenav-logo">
              <h3>Turnero Xtrim</h3>
            </div>
            
            <mat-nav-list>
              <a mat-list-item routerLink="/booking" (click)="sidenav.close()">
                <mat-icon matListItemIcon>event_available</mat-icon>
                <span matListItemTitle>Reservar Turno</span>
              </a>
              
              <ng-container *ngIf="authService.isLoggedIn">
                <a mat-list-item routerLink="/agent" (click)="sidenav.close()">
                  <mat-icon matListItemIcon>person</mat-icon>
                  <span matListItemTitle>Agente</span>
                </a>
                
                <ng-container *ngIf="authService.isSupervisor()">
                  <a mat-list-item routerLink="/supervisor" (click)="sidenav.close()">
                    <mat-icon matListItemIcon>supervisor_account</mat-icon>
                    <span matListItemTitle>Supervisor</span>
                  </a>
                  <a mat-list-item routerLink="/reports" (click)="sidenav.close()">
                    <mat-icon matListItemIcon>assessment</mat-icon>
                    <span matListItemTitle>Reportes</span>
                  </a>
                </ng-container>
                
                <mat-divider></mat-divider>
                
                <div class="user-info">
                  <mat-icon>account_circle</mat-icon>
                  <div class="user-details">
                    <span class="user-name">{{ authService.currentUser?.name }}</span>
                    <small class="user-role">{{ authService.currentUser?.role }}</small>
                  </div>
                </div>
                
                <a mat-list-item (click)="logout(); sidenav.close()" class="logout-item">
                  <mat-icon matListItemIcon>exit_to_app</mat-icon>
                  <span matListItemTitle>Cerrar Sesión</span>
                </a>
              </ng-container>
              
              <a *ngIf="!authService.isLoggedIn" mat-list-item routerLink="/login" (click)="sidenav.close()">
                <mat-icon matListItemIcon>login</mat-icon>
                <span matListItemTitle>Iniciar Sesión</span>
              </a>
            </mat-nav-list>
          </div>
        </mat-sidenav>
        
        <mat-sidenav-content>
          <app-header [sidenav]="sidenav"></app-header>
          
          <div class="content">
            <div class="theme-toggle">
              <button mat-icon-button (click)="toggleTheme()">
                <mat-icon>{{ (darkMode$ | async) ? 'light_mode' : 'dark_mode' }}</mat-icon>
              </button>
            </div>
            <router-outlet></router-outlet>
          </div>
          
          <app-footer></app-footer>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      width: 100%;
      overflow-x: hidden;
    }
    
    .sidenav-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    .mobile-sidenav {
      width: 280px;
      background-color: #3F1B6A;
    }
    
    .sidenav-content {
      padding: 0;
      color: white;
    }
    
    .sidenav-header {
      padding: 24px 16px;
      background-color: rgba(255,255,255,0.1);
      display: flex;
      align-items: center;
      gap: 12px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    
    .sidenav-logo {
      height: 32px;
    }
    
    .sidenav-header h3 {
      margin: 0;
      color: white;
      font-family: 'Ubuntu', sans-serif;
      font-weight: 500;
    }
    
    .user-info {
      display: flex;
      align-items: center;
      padding: 16px;
      gap: 12px;
      background-color: rgba(255,255,255,0.05);
      margin: 8px 0;
    }
    
    .user-details {
      display: flex;
      flex-direction: column;
    }
    
    .user-name {
      font-weight: 500;
      color: white;
    }
    
    .user-role {
      opacity: 0.7;
      font-size: 0.75rem;
      color: white;
    }
    
    .logout-item {
      color: #ff6b6b !important;
    }
    
    mat-sidenav-content {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    
    .content {
      flex: 1;
      padding: 16px;
      max-width: 1200px;
      margin: 0 auto;
      position: relative;
      width: 100%;
      box-sizing: border-box;
    }
    
    .theme-toggle {
      position: absolute;
      top: 0;
      right: 0;
      z-index: 100;
    }
    
    ::ng-deep .mat-mdc-list-item {
      color: white !important;
    }
    
    ::ng-deep .mat-mdc-list-item .mdc-list-item__primary-text {
      color: white !important;
    }
    
    ::ng-deep .mat-mdc-list-item-icon {
      color: white !important;
    }
    
    @media (max-width: 768px) {
      .content {
        padding: 8px;
      }
      
      .theme-toggle {
        display: none;
      }
    }
  `]
})
export class AppComponent {
  darkMode$: Observable<boolean>;
  
  constructor(
    private store: Store,
    public authService: AuthService
  ) {
    this.darkMode$ = this.store.select(selectDarkMode);
  }
  
  toggleTheme() {
    this.store.dispatch(toggleDarkMode());
  }
  
  logout(): void {
    this.authService.logout();
  }
}