import { createFeatureSelector, createSelector } from '@ngrx/store';
import { State } from './agents.reducer';

export const selectAgentsState = createFeatureSelector<State>('agents');

export const selectAllAgents = createSelector(
  selectAgentsState,
  state => state.agents
);

export const selectCurrentAgent = createSelector(
  selectAgentsState,
  state => state.currentAgent
);

export const selectAvailableAgents = createSelector(
  selectAllAgents,
  agents => agents.filter(agent => agent.status === 'disponible')
);

export const selectUnavailableAgents = createSelector(
  selectAllAgents,
  agents => agents.filter(agent => agent.status === 'no_disponible')
);

export const selectAgentsLoading = createSelector(
  selectAgentsState,
  state => state.loading
);

export const selectAgentsError = createSelector(
  selectAgentsState,
  state => state.error
);