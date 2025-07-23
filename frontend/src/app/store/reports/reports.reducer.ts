import { createReducer, on } from '@ngrx/store';
import * as ReportsActions from './reports.actions';
import { Metrics } from '../../core/models/report.model';

export interface State {
  metrics: Metrics | null;
  reportBlob: Blob | null;
  loading: boolean;
  error: any;
}

export const initialState: State = {
  metrics: null,
  reportBlob: null,
  loading: false,
  error: null
};

export const reducer = createReducer(
  initialState,
  
  // Get Metrics
  on(ReportsActions.getMetrics, state => ({
    ...state,
    loading: true,
    error: null
  })),
  on(ReportsActions.getMetricsSuccess, (state, { metrics }) => ({
    ...state,
    metrics,
    loading: false
  })),
  on(ReportsActions.getMetricsFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  })),
  
  // Download Report
  on(ReportsActions.downloadReport, state => ({
    ...state,
    loading: true,
    error: null
  })),
  on(ReportsActions.downloadReportSuccess, (state, { blob }) => ({
    ...state,
    reportBlob: blob,
    loading: false
  })),
  on(ReportsActions.downloadReportFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  }))
);