import { isDevMode } from '@angular/core';
import { ActionReducerMap, MetaReducer } from '@ngrx/store';

import * as fromTurns from './turns/turns.reducer';
import * as fromAgents from './agents/agents.reducer';
import * as fromReports from './reports/reports.reducer';
import * as fromUI from './ui/ui.reducer';

export interface AppState {
  turns: fromTurns.State;
  agents: fromAgents.State;
  reports: fromReports.State;
  ui: fromUI.State;
}

export const reducers: ActionReducerMap<AppState> = {
  turns: fromTurns.reducer,
  agents: fromAgents.reducer,
  reports: fromReports.reducer,
  ui: fromUI.reducer
};

export const metaReducers: MetaReducer<AppState>[] = isDevMode() ? [] : [];