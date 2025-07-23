import { createFeatureSelector, createSelector } from '@ngrx/store';
import { State } from './turns.reducer';

export const selectTurnsState = createFeatureSelector<State>('turns');

export const selectCurrentTurn = createSelector(
  selectTurnsState,
  state => state.currentTurn
);

export const selectQueue = createSelector(
  selectTurnsState,
  state => state.queue
);

export const selectTurnsLoading = createSelector(
  selectTurnsState,
  state => state.loading
);

export const selectTurnsError = createSelector(
  selectTurnsState,
  state => state.error
);