import { createReducer, on } from '@ngrx/store';
import * as AgentsActions from './agents.actions';
import { Agent } from '../../core/models/agent.model';

export interface State {
  agents: Agent[];
  currentAgent: Agent | null;
  loading: boolean;
  error: any;
}

export const initialState: State = {
  agents: [],
  currentAgent: null,
  loading: false,
  error: null
};

export const reducer = createReducer(
  initialState,
  
  // Get Agents
  on(AgentsActions.getAgents, state => ({
    ...state,
    loading: true,
    error: null
  })),
  on(AgentsActions.getAgentsSuccess, (state, { agents }) => ({
    ...state,
    agents,
    loading: false
  })),
  on(AgentsActions.getAgentsFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  })),
  
  // Get Agent
  on(AgentsActions.getAgent, state => ({
    ...state,
    loading: true,
    error: null
  })),
  on(AgentsActions.getAgentSuccess, (state, { agent }) => ({
    ...state,
    currentAgent: agent,
    loading: false
  })),
  on(AgentsActions.getAgentFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  })),
  
  // Create Agent
  on(AgentsActions.createAgent, state => ({
    ...state,
    loading: true,
    error: null
  })),
  on(AgentsActions.createAgentSuccess, (state, { agent }) => ({
    ...state,
    agents: [...state.agents, agent],
    currentAgent: agent,
    loading: false
  })),
  on(AgentsActions.createAgentFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  })),
  
  // Update Agent Status
  on(AgentsActions.updateAgentStatus, state => ({
    ...state,
    loading: true,
    error: null
  })),
  on(AgentsActions.updateAgentStatusSuccess, (state, { agent }) => ({
    ...state,
    agents: state.agents.map(a => a.id === agent.id ? agent : a),
    currentAgent: agent,
    loading: false
  })),
  on(AgentsActions.updateAgentStatusFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  }))
);