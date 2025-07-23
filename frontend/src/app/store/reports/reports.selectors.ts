import { createFeatureSelector, createSelector } from '@ngrx/store';
import { State } from './reports.reducer';

export const selectReportsState = createFeatureSelector<State>('reports');

export const selectMetrics = createSelector(
  selectReportsState,
  state => state.metrics
);

export const selectReportBlob = createSelector(
  selectReportsState,
  state => state.reportBlob
);

export const selectReportsLoading = createSelector(
  selectReportsState,
  state => state.loading
);

export const selectReportsError = createSelector(
  selectReportsState,
  state => state.error
);