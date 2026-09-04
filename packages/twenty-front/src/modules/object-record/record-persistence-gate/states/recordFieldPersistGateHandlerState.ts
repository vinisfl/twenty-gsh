import { type RecordFieldPersistGateHandler } from '@/object-record/record-persistence-gate/types/RecordFieldPersistGateHandler';
import { atom } from 'jotai';

export const recordFieldPersistGateHandlerState = atom<
  RecordFieldPersistGateHandler | undefined
>(undefined);
recordFieldPersistGateHandlerState.debugLabel =
  'recordFieldPersistGateHandlerState';
