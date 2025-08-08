import { createReducer, on } from '@ngrx/store';
import * as TurnsActions from './turns.actions';
import { Turn } from '../../core/models/turn.model';
import { Queue } from '../../core/models/queue.model';

export interface State {
  currentTurn: Turn | null;
  queue: Queue | null;
  loading: boolean;
  error: any;
}

export const initialState: State = {
  currentTurn: null,
  queue: null,
  loading: false,
  error: null
};

export const reducer = createReducer(
  initialState,
  
  // Create Turn
  on(TurnsActions.createTurn, state => ({
    ...state,
    loading: true,
    error: null
  })),
  on(TurnsActions.createTurnSuccess, (state, { turn }) => ({
    ...state,
    currentTurn: turn,
    loading: false
  })),
  on(TurnsActions.createTurnFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  })),
  
  // Get Turn
  on(TurnsActions.getTurn, state => ({
    ...state,
    loading: true,
    error: null
  })),
  on(TurnsActions.getTurnSuccess, (state, { turn }) => ({
    ...state,
    currentTurn: turn,
    loading: false
  })),
  on(TurnsActions.getTurnFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  })),
  
  // Update Turn
  on(TurnsActions.updateTurn, state => ({
    ...state,
    loading: true,
    error: null
  })),
  on(TurnsActions.updateTurnSuccess, (state, { turn }) => ({
    ...state,
    currentTurn: turn,
    loading: false
  })),
  on(TurnsActions.updateTurnFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  })),
  
  // Get Queue
  on(TurnsActions.getQueue, state => {
    console.log('Reducer: getQueue action received');
    return {
      ...state,
      loading: true,
      error: null
    };
  }),
  on(TurnsActions.getQueueSuccess, (state, { queue }) => {
    console.log('Reducer: getQueueSuccess action received', queue);
    return {
      ...state,
      queue,
      loading: false
    };
  }),
  on(TurnsActions.getQueueFailure, (state, { error }) => {
    console.log('Reducer: getQueueFailure action received', error);
    return {
      ...state,
      error,
      loading: false
    };
  })
);