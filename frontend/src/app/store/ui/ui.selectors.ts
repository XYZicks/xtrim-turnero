import { createFeatureSelector, createSelector } from '@ngrx/store';
import { State } from './ui.reducer';

export const selectUIState = createFeatureSelector<State>('ui');

export const selectDarkMode = createSelector(
  selectUIState,
  state => state.darkMode
);