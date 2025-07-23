import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';
import { ReportsService } from '../../core/services/reports.service';
import * as ReportsActions from './reports.actions';

@Injectable()
export class ReportsEffects {
  
  getMetrics$ = createEffect(() => this.actions$.pipe(
    ofType(ReportsActions.getMetrics),
    mergeMap(({ params }) => 
      this.reportsService.getMetrics(params).pipe(
        map(metrics => ReportsActions.getMetricsSuccess({ metrics })),
        catchError(error => of(ReportsActions.getMetricsFailure({ error })))
      )
    )
  ));
  
  downloadReport$ = createEffect(() => this.actions$.pipe(
    ofType(ReportsActions.downloadReport),
    mergeMap(({ params }) => 
      this.reportsService.downloadReport(params).pipe(
        map(blob => ReportsActions.downloadReportSuccess({ blob })),
        catchError(error => of(ReportsActions.downloadReportFailure({ error })))
      )
    )
  ));
  
  constructor(
    private actions$: Actions,
    private reportsService: ReportsService
  ) {}
}