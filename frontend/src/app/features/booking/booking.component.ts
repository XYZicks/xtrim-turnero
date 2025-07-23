import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { createTurn } from '../../store/turns/turns.actions';
import { selectTurnsLoading, selectTurnsError, selectCurrentTurn } from '../../store/turns/turns.selectors';
import { Turn } from '../../core/models/turn.model';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatRadioModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="container">
      <h1 class="page-title">Reservar Turno</h1>
      
      <mat-card>
        <mat-card-content>
          <form [formGroup]="bookingForm" (ngSubmit)="onSubmit()">
            <div class="form-section">
              <h2>Tipo de Turno</h2>
              <mat-radio-group formControlName="turn_type" class="turn-type-group">
                <mat-radio-button value="normal">Normal</mat-radio-button>
                <mat-radio-button value="preferential">Preferencial</mat-radio-button>
              </mat-radio-group>
            </div>
            
            <div class="form-section" *ngIf="showCustomerInfo()">
              <h2>Información Personal</h2>
              <mat-form-field class="full-width">
                <mat-label>Nombre Completo</mat-label>
                <input matInput formControlName="customer_name">
                <mat-error *ngIf="bookingForm.get('customer_name')?.hasError('required')">
                  Nombre es requerido
                </mat-error>
              </mat-form-field>
              
              <mat-form-field class="full-width">
                <mat-label>Cédula</mat-label>
                <input matInput formControlName="customer_cedula">
                <mat-error *ngIf="bookingForm.get('customer_cedula')?.hasError('required')">
                  Cédula es requerida para turnos preferenciales
                </mat-error>
              </mat-form-field>
              
              <mat-form-field class="full-width">
                <mat-label>Email</mat-label>
                <input matInput formControlName="customer_email" type="email">
                <mat-error *ngIf="bookingForm.get('customer_email')?.hasError('email')">
                  Email inválido
                </mat-error>
              </mat-form-field>
            </div>
            
            <div class="form-section">
              <h2>Motivo de Visita</h2>
              <mat-form-field class="full-width">
                <mat-label>Seleccione un motivo</mat-label>
                <mat-select formControlName="reason">
                  <mat-option value="consulta">Consulta</mat-option>
                  <mat-option value="pago">Pago</mat-option>
                  <mat-option value="reclamo">Reclamo</mat-option>
                  <mat-option value="soporte">Soporte Técnico</mat-option>
                  <mat-option value="otro">Otro</mat-option>
                </mat-select>
                <mat-error *ngIf="bookingForm.get('reason')?.hasError('required')">
                  Motivo es requerido
                </mat-error>
              </mat-form-field>
            </div>
            
            <div class="form-actions">
              <button mat-raised-button color="primary" type="submit" [disabled]="bookingForm.invalid || (loading$ | async)">
                <span *ngIf="!(loading$ | async)">Reservar Turno</span>
                <mat-spinner diameter="24" *ngIf="loading$ | async"></mat-spinner>
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .form-section {
      margin-bottom: 24px;
    }
    
    .turn-type-group {
      display: flex;
      flex-direction: column;
      margin: 15px 0;
    }
    
    .form-actions {
      display: flex;
      justify-content: flex-end;
    }
    
    mat-radio-button {
      margin: 5px;
    }
    
    h2 {
      color: #E30613;
      font-weight: 500;
      margin-bottom: 16px;
    }
    
    .page-title {
      color: #E30613;
      font-weight: 700;
      margin-bottom: 24px;
    }
    
    mat-card {
      border-top: 4px solid #E30613;
    }
  `]
})
export class BookingComponent implements OnInit {
  bookingForm: FormGroup;
  loading$: Observable<boolean>;
  error$: Observable<any>;
  currentTurn$: Observable<Turn | null>;
  branchId: number = 1; // Default branch ID, would normally come from QR code
  
  constructor(
    private fb: FormBuilder,
    private store: Store,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.bookingForm = this.fb.group({
      turn_type: ['normal', Validators.required],
      customer_name: [''],
      customer_cedula: [''],
      customer_email: ['', Validators.email],
      reason: ['', Validators.required]
    });
    
    this.loading$ = this.store.select(selectTurnsLoading);
    this.error$ = this.store.select(selectTurnsError);
    this.currentTurn$ = this.store.select(selectCurrentTurn);
  }
  
  ngOnInit(): void {
    // Get branch ID from query params if available
    this.route.queryParams.subscribe(params => {
      if (params['branchId']) {
        this.branchId = +params['branchId'];
      }
    });
    
    // Update validators when turn type changes
    this.bookingForm.get('turn_type')?.valueChanges.subscribe(value => {
      const cedulaControl = this.bookingForm.get('customer_cedula');
      const nameControl = this.bookingForm.get('customer_name');
      
      if (value === 'preferential') {
        cedulaControl?.setValidators([Validators.required]);
        nameControl?.setValidators([Validators.required]);
      } else {
        cedulaControl?.clearValidators();
        nameControl?.clearValidators();
      }
      
      cedulaControl?.updateValueAndValidity();
      nameControl?.updateValueAndValidity();
    });
    
    // Navigate to ticket page when turn is created
    this.currentTurn$.subscribe(turn => {
      if (turn) {
        this.router.navigate(['/ticket', turn.id]);
      }
    });
  }
  
  showCustomerInfo(): boolean {
    return this.bookingForm.get('turn_type')?.value === 'preferential';
  }
  
  onSubmit(): void {
    if (this.bookingForm.valid) {
      const turnData = {
        ...this.bookingForm.value,
        branch_id: this.branchId
      };
      
      this.store.dispatch(createTurn({ turn: turnData }));
    }
  }
}