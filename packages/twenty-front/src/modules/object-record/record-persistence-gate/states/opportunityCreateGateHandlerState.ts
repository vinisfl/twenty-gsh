import { type OpportunityCreateGateHandler } from '@/object-record/record-persistence-gate/types/OpportunityCreateGateHandler';
import { atom } from 'jotai';

export const opportunityCreateGateHandlerState = atom<
  OpportunityCreateGateHandler | undefined
>(undefined);
opportunityCreateGateHandlerState.debugLabel =
  'opportunityCreateGateHandlerState';
