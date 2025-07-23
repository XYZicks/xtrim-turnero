import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div class="text-center">
          <img src="assets/xtrim-logo.png" alt="Xtrim Logo" class="mx-auto h-12 w-auto">
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Iniciar sesión
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            Ingrese sus credenciales para acceder al sistema
          </p>
        </div>
        
        <mat-card class="p-6 bg-white shadow-md rounded-lg">
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <div>
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Correo electrónico</mat-label>
                <input matInput formControlName="email" placeholder="ejemplo@xtrim.com" type="email">
                <mat-error *ngIf="loginForm.get('email')?.hasError('required')">
                  El correo electrónico es requerido
                </mat-error>
                <mat-error *ngIf="loginForm.get('email')?.hasError('email')">
                  Ingrese un correo electrónico válido
                </mat-error>
              </mat-form-field>
            </div>
            
            <div>
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Contraseña</mat-label>
                <input matInput formControlName="password" type="password" placeholder="********">
                <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
                  La contraseña es requerida
                </mat-error>
              </mat-form-field>
            </div>
            
            <div class="flex justify-center">
              <button 
                mat-raised-button 
                color="primary" 
                type="submit" 
                [disabled]="loginForm.invalid || isLoading"
                class="w-full py-2 bg-xtrim-purple text-white rounded-md hover:bg-opacity-90 transition-all">
                <span *ngIf="!isLoading">Iniciar sesión</span>
                <mat-spinner *ngIf="isLoading" diameter="24" class="mx-auto"></mat-spinner>
              </button>
            </div>
            
            <div *ngIf="error" class="text-red-500 text-center text-sm mt-2">
              {{ error }}
            </div>
          </form>
        </mat-card>
      </div>
    </div>
  `,
  styles: []
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  error = '';
  returnUrl = '/';
  
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }
  
  ngOnInit(): void {
    // Get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    
    // Redirect if already logged in
    if (this.authService.isLoggedIn) {
      this.router.navigate([this.returnUrl]);
    }
  }
  
  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }
    
    this.isLoading = true;
    this.error = '';
    
    const { email, password } = this.loginForm.value;
    
    this.authService.login(email, password).subscribe({
      next: () => {
        this.router.navigate([this.returnUrl]);
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al iniciar sesión. Verifique sus credenciales.';
        this.isLoading = false;
      }
    });
  }
}