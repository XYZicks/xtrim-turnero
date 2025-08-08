import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';
import { TurnsService } from '../../core/services/turns.service';
import * as TurnsActions from './turns.actions';

@Injectable()
export class TurnsEffects {
  
  createTurn$ = createEffect(() => this.actions$.pipe(
    ofType(TurnsActions.createTurn),
    mergeMap(({ turn }) => 
      this.turnsService.createTurn(turn).pipe(
        map(turn => TurnsActions.createTurnSuccess({ turn })),
        catchError(error => of(TurnsActions.createTurnFailure({ error })))
      )
    )
  ));
  
  getTurn$ = createEffect(() => this.actions$.pipe(
    ofType(TurnsActions.getTurn),
    mergeMap(({ id }) => 
      this.turnsService.getTurn(id).pipe(
        map(turn => TurnsActions.getTurnSuccess({ turn })),
        catchError(error => of(TurnsActions.getTurnFailure({ error })))
      )
    )
  ));
  
  updateTurn$ = createEffect(() => this.actions$.pipe(
    ofType(TurnsActions.updateTurn),
    mergeMap(({ id, update }) => 
      this.turnsService.updateTurn(id, update).pipe(
        map(turn => TurnsActions.updateTurnSuccess({ turn })),
        catchError(error => of(TurnsActions.updateTurnFailure({ error })))
      )
    )
  ));
  
  getQueue$ = createEffect(() => this.actions$.pipe(
    ofType(TurnsActions.getQueue),
    mergeMap(({ branchId }) => {
      console.log('Effect: getQueue called for branch', branchId);
      return this.turnsService.getQueue(branchId).pipe(
        map(queue => {
          console.log('Effect: getQueue HTTP response', queue);
          return TurnsActions.getQueueSuccess({ queue });
        }),
        catchError(error => {
          console.error('Effect: getQueue HTTP error', error);
          return of(TurnsActions.getQueueFailure({ error }));
        })
      );
    })
  ));
  
  constructor(
    private actions$: Actions,
    private turnsService: TurnsService
  ) {}
}