import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { AgentGuard } from './core/guards/agent.guard';
import { SupervisorGuard } from './core/guards/supervisor.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'booking',
    loadComponent: () => import('./features/booking/booking.component').then(m => m.BookingComponent)
  },
  {
    path: 'ticket/:id',
    loadComponent: () => import('./features/ticket/ticket.component').then(m => m.TicketComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'access-denied',
    loadComponent: () => import('./features/access-denied/access-denied.component').then(m => m.AccessDeniedComponent)
  },
  {
    path: 'agent',
    loadComponent: () => import('./features/agent/agent.component').then(m => m.AgentComponent),
    canActivate: [AgentGuard]
  },
  {
    path: 'supervisor',
    loadComponent: () => import('./features/supervisor/supervisor.component').then(m => m.SupervisorComponent),
    canActivate: [SupervisorGuard]
  },
  {
    path: 'reports',
    loadComponent: () => import('./features/reports/reports.component').then(m => m.ReportsComponent),
    canActivate: [SupervisorGuard]
  },
  {
    path: '**',
    redirectTo: 'booking'
  }
];