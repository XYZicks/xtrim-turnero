import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <mat-toolbar color="primary">
      <div class="container toolbar-container">
        <div class="logo-container">
          <a routerLink="/">
            <img src="assets/xtrim-logo.svg" alt="Xtrim Logo" class="logo">
            <span class="app-name">Turnero</span>
          </a>
        </div>
        
        <div class="nav-links">
          <a mat-button routerLink="/booking">Reservar Turno</a>
          <a mat-button routerLink="/agent">Agente</a>
          <a mat-button routerLink="/supervisor">Supervisor</a>
          <a mat-button routerLink="/reports">Reportes</a>
        </div>
      </div>
    </mat-toolbar>
  `,
  styles: [`
    .toolbar-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      padding: 0;
    }
    
    .logo-container {
      display: flex;
      align-items: center;
    }
    
    .logo-container a {
      display: flex;
      align-items: center;
      text-decoration: none;
      color: white;
    }
    
    .logo {
      height: 32px;
      margin-right: 8px;
    }
    
    .app-name {
      font-size: 20px;
      font-weight: 500;
    }
    
    .nav-links {
      display: flex;
      gap: 8px;
    }
    
    @media (max-width: 768px) {
      .toolbar-container {
        flex-direction: column;
        padding: 8px 0;
      }
      
      .nav-links {
        margin-top: 8px;
        flex-wrap: wrap;
        justify-content: center;
      }
    }
  `]
})
export class HeaderComponent {}