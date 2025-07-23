import { createAction, props } from '@ngrx/store';
import { Metrics, ReportParams } from '../../core/models/report.model';

// Get Metrics
export const getMetrics = createAction(
  '[Reports] Get Metrics',
  props<{ params: ReportParams }>()
);

export const getMetricsSuccess = createAction(
  '[Reports] Get Metrics Success',
  props<{ metrics: Metrics }>()
);

export const getMetricsFailure = createAction(
  '[Reports] Get Metrics Failure',
  props<{ error: any }>()
);

// Download Report
export const downloadReport = createAction(
  '[Reports] Download Report',
  props<{ params: ReportParams }>()
);

export const downloadReportSuccess = createAction(
  '[Reports] Download Report Success',
  props<{ blob: Blob }>()
);

export const downloadReportFailure = createAction(
  '[Reports] Download Report Failure',
  props<{ error: any }>()
);