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
      
      <div class="bg-white rounded-lg xtrim-shadow p-6">
        <form [formGroup]="bookingForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  <mat-label>Trámite</mat-label>
                  <mat-select formControlName="reason" (selectionChange)="onReasonChange($event)">
                    <mat-option value="soporte_tecnico">Soporte Técnico</mat-option>
                    <mat-option value="facturacion">Facturación</mat-option>
                    <mat-option value="nuevos_servicios">Nuevos Servicios</mat-option>
                    <mat-option value="reclamos">Reclamos</mat-option>
                    <mat-option value="otro">Otro</mat-option>
                  </mat-select>
                  <mat-error *ngIf="bookingForm.get('reason')?.hasError('required')">
                    El trámite es requerido
                  </mat-error>
                </mat-form-field>
              </div>
              
              <div class="mb-4" *ngIf="subReasons.length > 0">
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Sub-trámite</mat-label>
                  <mat-select formControlName="sub_reason">
                    <mat-option *ngFor="let sub of subReasons" [value]="sub.value">
                      {{ sub.label }}
                    </mat-option>
                  </mat-select>
                </mat-form-field>
              </div>
              
              <div class="mb-4">
                <label class="block text-gray-700 text-sm font-bold mb-2">Condición Especial</label>
                <mat-radio-group formControlName="special_condition" class="flex flex-col space-y-2">
                  <mat-radio-button value="ninguna" class="text-gray-700">Ninguna</mat-radio-button>
                  <mat-radio-button value="embarazada" class="text-gray-700">Embarazada</mat-radio-button>
                  <mat-radio-button value="adulto_mayor" class="text-gray-700">Adulto Mayor (+65)</mat-radio-button>
                  <mat-radio-button value="discapacidad" class="text-gray-700">Persona con Discapacidad</mat-radio-button>
                  <mat-radio-button value="nino_brazos" class="text-gray-700">Con Niño en Brazos</mat-radio-button>
                </mat-radio-group>
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
          
          <div class="flex justify-center mt-6 w-full">
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
  subReasons: {value: string, label: string}[] = [];
  
  branchId = 1; // Default branch ID
  
  private subReasonMap: {[key: string]: {value: string, label: string}[]} = {
    'soporte_tecnico': [
      {value: 'internet', label: 'Problemas de Internet'},
      {value: 'tv', label: 'Problemas de TV'},
      {value: 'telefono', label: 'Problemas de Teléfono'},
      {value: 'instalacion', label: 'Nueva Instalación'}
    ],
    'facturacion': [
      {value: 'pago', label: 'Realizar Pago'},
      {value: 'consulta', label: 'Consulta de Factura'},
      {value: 'reclamo_cobro', label: 'Reclamo de Cobro'}
    ],
    'nuevos_servicios': [
      {value: 'internet_nuevo', label: 'Contratar Internet'},
      {value: 'tv_nuevo', label: 'Contratar TV'},
      {value: 'paquete', label: 'Contratar Paquete'}
    ],
    'reclamos': [
      {value: 'servicio', label: 'Reclamo de Servicio'},
      {value: 'atencion', label: 'Reclamo de Atención'},
      {value: 'facturacion_reclamo', label: 'Reclamo de Facturación'}
    ]
  };
  
  constructor(
    private fb: FormBuilder,
    private turnsService: TurnsService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.bookingForm = this.fb.group({
      turn_type: ['normal', Validators.required],
      reason: ['', Validators.required],
      sub_reason: [''],
      special_condition: ['ninguna', Validators.required],
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
    
    // Auto-set preferential for special conditions
    this.bookingForm.get('special_condition')?.valueChanges.subscribe(value => {
      if (value !== 'ninguna') {
        this.bookingForm.patchValue({turn_type: 'preferential'});
      }
    });
  }
  
  ngOnInit(): void {
    // Get branch ID from query params if available
    const branchIdParam = this.route.snapshot.queryParamMap.get('branchId');
    if (branchIdParam) {
      this.branchId = parseInt(branchIdParam, 10) || 1;
    }
  }
  
  onReasonChange(event: any) {
    const reason = event.value;
    this.subReasons = this.subReasonMap[reason] || [];
    this.bookingForm.patchValue({sub_reason: ''});
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