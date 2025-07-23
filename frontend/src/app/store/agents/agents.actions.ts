import { createAction, props } from '@ngrx/store';
import { Agent, CreateAgentRequest, UpdateAgentStatusRequest } from '../../core/models/agent.model';

// Get Agents
export const getAgents = createAction(
  '[Agents] Get Agents',
  props<{ branchId?: number, status?: string }>()
);

export const getAgentsSuccess = createAction(
  '[Agents] Get Agents Success',
  props<{ agents: Agent[] }>()
);

export const getAgentsFailure = createAction(
  '[Agents] Get Agents Failure',
  props<{ error: any }>()
);

// Get Agent
export const getAgent = createAction(
  '[Agents] Get Agent',
  props<{ id: number }>()
);

export const getAgentSuccess = createAction(
  '[Agents] Get Agent Success',
  props<{ agent: Agent }>()
);

export const getAgentFailure = createAction(
  '[Agents] Get Agent Failure',
  props<{ error: any }>()
);

// Create Agent
export const createAgent = createAction(
  '[Agents] Create Agent',
  props<{ agent: CreateAgentRequest }>()
);

export const createAgentSuccess = createAction(
  '[Agents] Create Agent Success',
  props<{ agent: Agent }>()
);

export const createAgentFailure = createAction(
  '[Agents] Create Agent Failure',
  props<{ error: any }>()
);

// Update Agent Status
export const updateAgentStatus = createAction(
  '[Agents] Update Agent Status',
  props<{ id: number, update: UpdateAgentStatusRequest }>()
);

export const updateAgentStatusSuccess = createAction(
  '[Agents] Update Agent Status Success',
  props<{ agent: Agent }>()
);

export const updateAgentStatusFailure = createAction(
  '[Agents] Update Agent Status Failure',
  props<{ error: any }>()
);