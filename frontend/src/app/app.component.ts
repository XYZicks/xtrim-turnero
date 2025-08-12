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
    HeaderComponent,
    FooterComponent
  ],
  template: `
    <div [class.dark-theme]="darkMode$ | async" class="app-container">
      <app-header></app-header>
      
      <div class="content">
        <div class="theme-toggle">
          <button mat-icon-button (click)="toggleTheme()">
            <mat-icon>{{ (darkMode$ | async) ? 'light_mode' : 'dark_mode' }}</mat-icon>
          </button>
        </div>
        <router-outlet></router-outlet>
      </div>
      
      <app-footer></app-footer>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    .content {
      flex: 1;
      padding: 16px;
      max-width: 1200px;
      margin: 0 auto;
      position: relative;
      width: 100%;
    }
    
    .theme-toggle {
      position: absolute;
      top: 0;
      right: 0;
    }
  `]
})
export class AppComponent {
  darkMode$: Observable<boolean>;
  
  constructor(private store: Store) {
    this.darkMode$ = this.store.select(selectDarkMode);
  }
  
  toggleTheme() {
    this.store.dispatch(toggleDarkMode());
  }
}