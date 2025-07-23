import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class SupervisorGuard {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // Check if user is logged in and is a supervisor
    if (this.authService.isLoggedIn && this.authService.isSupervisor()) {
      return true;
    }
    
    if (this.authService.isLoggedIn) {
      // User is logged in but not a supervisor
      this.router.navigate(['/access-denied']);
      return false;
    }
    
    // Not logged in, redirect to login page
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}