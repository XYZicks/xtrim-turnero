import { createReducer, on } from '@ngrx/store';
import * as UIActions from './ui.actions';

export interface State {
  darkMode: boolean;
}

export const initialState: State = {
  darkMode: false
};

export const reducer = createReducer(
  initialState,
  on(UIActions.toggleDarkMode, state => ({
    ...state,
    darkMode: !state.darkMode
  }))
);