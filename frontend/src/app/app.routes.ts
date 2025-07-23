import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'booking',
    pathMatch: 'full'
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
    path: 'agent',
    loadComponent: () => import('./features/agent/agent.component').then(m => m.AgentComponent)
  },
  {
    path: 'supervisor',
    loadComponent: () => import('./features/supervisor/supervisor.component').then(m => m.SupervisorComponent)
  },
  {
    path: 'reports',
    loadComponent: () => import('./features/reports/reports.component').then(m => m.ReportsComponent)
  },
  {
    path: '**',
    redirectTo: 'booking'
  }
];