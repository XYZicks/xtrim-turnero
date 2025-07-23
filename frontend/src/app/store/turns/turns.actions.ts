import { createAction, props } from '@ngrx/store';
import { Turn, CreateTurnRequest, UpdateTurnRequest } from '../../core/models/turn.model';
import { Queue } from '../../core/models/queue.model';

// Create Turn
export const createTurn = createAction(
  '[Turns] Create Turn',
  props<{ turn: CreateTurnRequest }>()
);

export const createTurnSuccess = createAction(
  '[Turns] Create Turn Success',
  props<{ turn: Turn }>()
);

export const createTurnFailure = createAction(
  '[Turns] Create Turn Failure',
  props<{ error: any }>()
);

// Get Turn
export const getTurn = createAction(
  '[Turns] Get Turn',
  props<{ id: number }>()
);

export const getTurnSuccess = createAction(
  '[Turns] Get Turn Success',
  props<{ turn: Turn }>()
);

export const getTurnFailure = createAction(
  '[Turns] Get Turn Failure',
  props<{ error: any }>()
);

// Update Turn
export const updateTurn = createAction(
  '[Turns] Update Turn',
  props<{ id: number, update: UpdateTurnRequest }>()
);

export const updateTurnSuccess = createAction(
  '[Turns] Update Turn Success',
  props<{ turn: Turn }>()
);

export const updateTurnFailure = createAction(
  '[Turns] Update Turn Failure',
  props<{ error: any }>()
);

// Get Queue
export const getQueue = createAction(
  '[Turns] Get Queue',
  props<{ branchId: number }>()
);

export const getQueueSuccess = createAction(
  '[Turns] Get Queue Success',
  props<{ queue: Queue }>()
);

export const getQueueFailure = createAction(
  '[Turns] Get Queue Failure',
  props<{ error: any }>()
);