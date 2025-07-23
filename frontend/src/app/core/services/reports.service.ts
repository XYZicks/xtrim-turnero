import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Metrics, ReportParams } from '../models/report.model';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  private apiUrl = `${environment.reportsApiUrl}/reports`;

  constructor(private http: HttpClient) { }

  getMetrics(params: ReportParams): Observable<Metrics> {
    return this.http.get<Metrics>(`${this.apiUrl}/metrics`, { params: params as any });
  }

  downloadReport(params: ReportParams): Observable<Blob> {
    const downloadParams = { ...params, format: 'csv' };
    return this.http.get(`${this.apiUrl}/metrics`, {
      params: downloadParams as any,
      responseType: 'blob'
    });
  }
}