import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  branch_id: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.authApiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        this.currentUserSubject.next(userData);
      } catch (e) {
        localStorage.removeItem('currentUser');
      }
    }
  }
  
  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(response => {
          // Store user details and token
          localStorage.setItem('token', response.token);
          localStorage.setItem('currentUser', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
        })
      );
  }
  
  logout(): void {
    // Remove user from local storage
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }
  
  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }
  
  get token(): string | null {
    return localStorage.getItem('token');
  }
  
  get isLoggedIn(): boolean {
    return !!this.currentUser;
  }
  
  hasRole(role: string): boolean {
    return this.currentUser?.role === role;
  }
  
  isAgent(): boolean {
    return this.currentUser?.role === 'AGENTE';
  }
  
  isSupervisor(): boolean {
    return this.currentUser?.role === 'SUPERVISOR';
  }
  
  canAccessRoute(route: string): boolean {
    if (!this.isLoggedIn) return false;
    
    if (route === '/agent') {
      return true; // Both roles can access agent route
    }
    
    if (route === '/supervisor' || route === '/reports') {
      return this.isSupervisor();
    }
    
    return false;
  }
}