import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { getMetrics, downloadReport } from '../../store/reports/reports.actions';
import { selectMetrics, selectReportsLoading, selectReportsError } from '../../store/reports/reports.selectors';
import { Metrics, Report } from '../../core/models/report.model';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatTableModule
  ],
  template: `
    <div class="container">
      <h1 class="page-title">Reportes</h1>
      
      <mat-card class="filter-card">
        <mat-card-header>
          <mat-card-title>Filtros</mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="filterForm" (ngSubmit)="onSubmit()">
            <div class="form-row">
              <mat-form-field>
                <mat-label>Agencia</mat-label>
                <mat-select formControlName="branch_id">
                  <mat-option [value]="null">Todas</mat-option>
                  <mat-option [value]="1">Agencia Principal</mat-option>
                  <mat-option [value]="2">Agencia Norte</mat-option>
                  <mat-option [value]="3">Agencia Sur</mat-option>
                </mat-select>
              </mat-form-field>
              
              <mat-form-field>
                <mat-label>Fecha Inicio</mat-label>
                <input matInput [matDatepicker]="startPicker" formControlName="start_date">
                <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
                <mat-datepicker #startPicker></mat-datepicker>
                <mat-error *ngIf="filterForm.get('start_date')?.hasError('required')">
                  Fecha de inicio es requerida
                </mat-error>
              </mat-form-field>
              
              <mat-form-field>
                <mat-label>Fecha Fin</mat-label>
                <input matInput [matDatepicker]="endPicker" formControlName="end_date">
                <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
                <mat-datepicker #endPicker></mat-datepicker>
                <mat-error *ngIf="filterForm.get('end_date')?.hasError('required')">
                  Fecha de fin es requerida
                </mat-error>
              </mat-form-field>
            </div>
            
            <div class="form-actions">
              <button mat-raised-button color="primary" type="submit" [disabled]="filterForm.invalid || (loading$ | async)">
                <mat-icon>search</mat-icon> Buscar
              </button>
              
              <button mat-raised-button color="accent" type="button" (click)="downloadCsv()" [disabled]="!hasMetrics || (loading$ | async)">
                <mat-icon>download</mat-icon> Exportar CSV
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
      
      <div *ngIf="loading$ | async" class="loading-container">
        <mat-spinner></mat-spinner>
      </div>
      
      <div *ngIf="error$ | async as error" class="error-container">
        <mat-card>
          <mat-card-content>
            <h2>Error al cargar los datos</h2>
            <p>{{ error.message }}</p>
          </mat-card-content>
        </mat-card>
      </div>
      
      <div *ngIf="metrics$ | async as metrics">
        <div class="metrics-grid">
          <mat-card class="metric-card">
            <div class="metric-value">{{ metrics.total_turns }}</div>
            <div class="metric-label">Turnos Totales</div>
          </mat-card>
          
          <mat-card class="metric-card">
            <div class="metric-value">{{ metrics.completed_turns }}</div>
            <div class="metric-label">Turnos Completados</div>
          </mat-card>
          
          <mat-card class="metric-card">
            <div class="metric-value">{{ metrics.abandoned_turns }}</div>
            <div class="metric-label">Turnos Abandonados</div>
          </mat-card>
          
          <mat-card class="metric-card">
            <div class="metric-value">{{ metrics.abandonment_rate.toFixed(2) }}%</div>
            <div class="metric-label">Tasa de Abandono</div>
          </mat-card>
          
          <mat-card class="metric-card">
            <div class="metric-value">{{ metrics.avg_wait_time.toFixed(1) }} min</div>
            <div class="metric-label">Tiempo de Espera Promedio</div>
          </mat-card>
          
          <mat-card class="metric-card">
            <div class="metric-value">{{ metrics.avg_service_time.toFixed(1) }} min</div>
            <div class="metric-label">Tiempo de Atención Promedio</div>
          </mat-card>
          
          <mat-card class="metric-card">
            <div class="metric-value">{{ metrics.unique_customers }}</div>
            <div class="metric-label">Clientes Únicos</div>
          </mat-card>
        </div>
        
        <mat-card class="daily-metrics-card">
          <mat-card-header>
            <mat-card-title>Métricas Diarias</mat-card-title>
          </mat-card-header>
          
          <mat-card-content>
            <table mat-table [dataSource]="metrics.daily_metrics" class="daily-table">
              <ng-container matColumnDef="report_date">
                <th mat-header-cell *matHeaderCellDef>Fecha</th>
                <td mat-cell *matCellDef="let item">{{ formatDate(item.report_date) }}</td>
              </ng-container>
              
              <ng-container matColumnDef="total_turns">
                <th mat-header-cell *matHeaderCellDef>Turnos</th>
                <td mat-cell *matCellDef="let item">{{ item.total_turns }}</td>
              </ng-container>
              
              <ng-container matColumnDef="completed_turns">
                <th mat-header-cell *matHeaderCellDef>Completados</th>
                <td mat-cell *matCellDef="let item">{{ item.completed_turns }}</td>
              </ng-container>
              
              <ng-container matColumnDef="abandoned_turns">
                <th mat-header-cell *matHeaderCellDef>Abandonados</th>
                <td mat-cell *matCellDef="let item">{{ item.abandoned_turns }}</td>
              </ng-container>
              
              <ng-container matColumnDef="avg_wait_time">
                <th mat-header-cell *matHeaderCellDef>T. Espera</th>
                <td mat-cell *matCellDef="let item">{{ item.avg_wait_time.toFixed(1) }} min</td>
              </ng-container>
              
              <ng-container matColumnDef="avg_service_time">
                <th mat-header-cell *matHeaderCellDef>T. Atención</th>
                <td mat-cell *matCellDef="let item">{{ item.avg_service_time.toFixed(1) }} min</td>
              </ng-container>
              
              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
            
            <div *ngIf="metrics.daily_metrics.length === 0" class="no-data">
              No hay datos disponibles para el período seleccionado
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .filter-card {
      margin-bottom: 24px;
    }
    
    .form-row {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }
    
    .form-row mat-form-field {
      flex: 1;
      min-width: 200px;
    }
    
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 16px;
      margin-top: 16px;
    }
    
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    
    .metric-card {
      text-align: center;
      padding: 16px;
    }
    
    .metric-value {
      font-size: 32px;
      font-weight: 500;
      color: #E30613;
    }
    
    .metric-label {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.6);
      margin-top: 8px;
    }
    
    .daily-table {
      width: 100%;
    }
    
    .no-data {
      padding: 16px;
      text-align: center;
      color: rgba(0, 0, 0, 0.6);
    }
    
    .loading-container {
      display: flex;
      justify-content: center;
      padding: 32px;
    }
    
    .error-container {
      margin-bottom: 24px;
    }
  `]
})
export class ReportsComponent implements OnInit {
  filterForm: FormGroup;
  metrics$: Observable<Metrics | null>;
  loading$: Observable<boolean>;
  error$: Observable<any>;
  hasMetrics: boolean = false;
  displayedColumns: string[] = ['report_date', 'total_turns', 'completed_turns', 'abandoned_turns', 'avg_wait_time', 'avg_service_time'];
  
  constructor(
    private fb: FormBuilder,
    private store: Store
  ) {
    this.filterForm = this.fb.group({
      branch_id: [null],
      start_date: [new Date(new Date().setDate(new Date().getDate() - 7)), Validators.required],
      end_date: [new Date(), Validators.required]
    });
    
    this.metrics$ = this.store.select(selectMetrics);
    this.loading$ = this.store.select(selectReportsLoading);
    this.error$ = this.store.select(selectReportsError);
  }
  
  ngOnInit(): void {
    this.metrics$.subscribe(metrics => {
      this.hasMetrics = !!metrics;
    });
  }
  
  onSubmit(): void {
    if (this.filterForm.valid) {
      const formValues = this.filterForm.value;
      
      const params = {
        branch_id: formValues.branch_id,
        start_date: this.formatDateForApi(formValues.start_date),
        end_date: this.formatDateForApi(formValues.end_date)
      };
      
      this.store.dispatch(getMetrics({ params }));
    }
  }
  
  downloadCsv(): void {
    if (this.filterForm.valid) {
      const formValues = this.filterForm.value;
      
      const params = {
        branch_id: formValues.branch_id,
        start_date: this.formatDateForApi(formValues.start_date),
        end_date: this.formatDateForApi(formValues.end_date),
        format: 'csv' as 'csv' // Aseguramos que TypeScript lo reconozca como tipo literal 'csv'
      };
      
      this.store.dispatch(downloadReport({ params }));
    }
  }
  
  formatDateForApi(date: Date): string {
    return date.toISOString().split('T')[0];
  }
  
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  }
}