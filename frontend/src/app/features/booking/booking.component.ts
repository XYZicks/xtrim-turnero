import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { Router, ActivatedRoute } from '@angular/router';
import { TurnsService } from '../../core/services/turns.service';
import { CreateTurnRequest } from '../../core/models/turn.model';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatRadioModule
  ],
  template: `
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-xtrim-purple mb-6">Reservar Turno</h1>
      
      <div class="bg-white rounded-lg shadow-lg p-6">
        <form [formGroup]="bookingForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 class="text-xl font-semibold mb-4 text-xtrim-purple">Información del Turno</h2>
              
              <div class="mb-4">
                <label class="block text-gray-700 text-sm font-bold mb-2">Tipo de Turno</label>
                <mat-radio-group formControlName="turn_type" class="flex flex-col space-y-2">
                  <mat-radio-button value="normal" class="text-gray-700">Normal</mat-radio-button>
                  <mat-radio-button value="preferential" class="text-gray-700">Preferencial</mat-radio-button>
                </mat-radio-group>
                <p *ngIf="bookingForm.get('turn_type')?.value === 'preferential'" 
                   class="text-sm text-gray-500 mt-1">
                  Los turnos preferenciales son para adultos mayores, personas con discapacidad, 
                  embarazadas o con niños en brazos.
                </p>
              </div>
              
              <div class="mb-4">
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Motivo de Visita</mat-label>
                  <mat-select formControlName="reason">
                    <mat-option value="soporte_tecnico">Soporte Técnico</mat-option>
                    <mat-option value="facturacion">Facturación</mat-option>
                    <mat-option value="nuevos_servicios">Nuevos Servicios</mat-option>
                    <mat-option value="reclamos">Reclamos</mat-option>
                    <mat-option value="otro">Otro</mat-option>
                  </mat-select>
                  <mat-error *ngIf="bookingForm.get('reason')?.hasError('required')">
                    El motivo de visita es requerido
                  </mat-error>
                </mat-form-field>
              </div>
            </div>
            
            <div>
              <h2 class="text-xl font-semibold mb-4 text-xtrim-purple">Información Personal</h2>
              
              <div class="mb-4">
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Nombre Completo</mat-label>
                  <input matInput formControlName="customer_name" placeholder="Ingrese su nombre completo">
                </mat-form-field>
              </div>
              
              <div class="mb-4">
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Cédula</mat-label>
                  <input matInput formControlName="customer_cedula" placeholder="Ingrese su número de cédula">
                  <mat-error *ngIf="bookingForm.get('customer_cedula')?.hasError('required') && 
                                   bookingForm.get('turn_type')?.value === 'preferential'">
                    La cédula es requerida para turnos preferenciales
                  </mat-error>
                </mat-form-field>
              </div>
              
              <div class="mb-4">
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Correo Electrónico</mat-label>
                  <input matInput formControlName="customer_email" placeholder="Ingrese su correo electrónico">
                  <mat-error *ngIf="bookingForm.get('customer_email')?.hasError('email')">
                    Ingrese un correo electrónico válido
                  </mat-error>
                </mat-form-field>
              </div>
            </div>
          </div>
          
          <div class="flex justify-center mt-6">
            <button mat-raised-button color="primary" type="submit" 
                    [disabled]="bookingForm.invalid" 
                    class="px-8 py-2 bg-xtrim-purple text-white rounded-md hover:bg-opacity-90 transition-all">
              Reservar Turno
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: []
})
export class BookingComponent implements OnInit {
  bookingForm: FormGroup;
  
  branchId = 1; // Default branch ID
  
  constructor(
    private fb: FormBuilder,
    private turnsService: TurnsService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.bookingForm = this.fb.group({
      turn_type: ['normal', Validators.required],
      reason: ['', Validators.required],
      customer_name: [''],
      customer_cedula: [''],
      customer_email: ['', [Validators.email]]
    });
    
    // Add conditional validation for preferential turns
    this.bookingForm.get('turn_type')?.valueChanges.subscribe(value => {
      const cedulaControl = this.bookingForm.get('customer_cedula');
      if (value === 'preferential') {
        cedulaControl?.setValidators([Validators.required]);
      } else {
        cedulaControl?.clearValidators();
      }
      cedulaControl?.updateValueAndValidity();
    });
  }
  
  ngOnInit(): void {
    // Get branch ID from query params if available
    const branchIdParam = this.route.snapshot.queryParamMap.get('branchId');
    if (branchIdParam) {
      this.branchId = parseInt(branchIdParam, 10) || 1;
    }
  }
  
  onSubmit() {
    if (this.bookingForm.valid) {
      const turnData: CreateTurnRequest = {
        ...this.bookingForm.value,
        branch_id: this.branchId
      };
      
      this.turnsService.createTurn(turnData).subscribe({
        next: (response) => {
          this.router.navigate(['/ticket', response.id]);
        },
        error: (error) => {
          console.error('Error creating turn', error);
          // Handle error (could add a snackbar or alert here)
        }
      });
    }
  }
}