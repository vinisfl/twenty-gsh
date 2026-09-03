import { type OpportunityStageAdvanceGateHandler } from '@/object-record/record-persistence-gate/types/OpportunityStageAdvanceGateHandler';
import { atom } from 'jotai';

export const opportunityStageAdvanceGateHandlerState = atom<
  OpportunityStageAdvanceGateHandler | undefined
>(undefined);
opportunityStageAdvanceGateHandlerState.debugLabel =
  'opportunityStageAdvanceGateHandlerState';
