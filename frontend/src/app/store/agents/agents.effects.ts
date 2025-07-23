import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';
import { AgentsService } from '../../core/services/agents.service';
import * as AgentsActions from './agents.actions';

@Injectable()
export class AgentsEffects {
  
  getAgents$ = createEffect(() => this.actions$.pipe(
    ofType(AgentsActions.getAgents),
    mergeMap(({ branchId, status }) => 
      this.agentsService.getAgents(branchId, status).pipe(
        map(agents => AgentsActions.getAgentsSuccess({ agents })),
        catchError(error => of(AgentsActions.getAgentsFailure({ error })))
      )
    )
  ));
  
  getAgent$ = createEffect(() => this.actions$.pipe(
    ofType(AgentsActions.getAgent),
    mergeMap(({ id }) => 
      this.agentsService.getAgent(id).pipe(
        map(agent => AgentsActions.getAgentSuccess({ agent })),
        catchError(error => of(AgentsActions.getAgentFailure({ error })))
      )
    )
  ));
  
  createAgent$ = createEffect(() => this.actions$.pipe(
    ofType(AgentsActions.createAgent),
    mergeMap(({ agent }) => 
      this.agentsService.createAgent(agent).pipe(
        map(agent => AgentsActions.createAgentSuccess({ agent })),
        catchError(error => of(AgentsActions.createAgentFailure({ error })))
      )
    )
  ));
  
  updateAgentStatus$ = createEffect(() => this.actions$.pipe(
    ofType(AgentsActions.updateAgentStatus),
    mergeMap(({ id, update }) => 
      this.agentsService.updateAgentStatus(id, update).pipe(
        map(agent => AgentsActions.updateAgentStatusSuccess({ agent })),
        catchError(error => of(AgentsActions.updateAgentStatusFailure({ error })))
      )
    )
  ));
  
  constructor(
    private actions$: Actions,
    private agentsService: AgentsService
  ) {}
}