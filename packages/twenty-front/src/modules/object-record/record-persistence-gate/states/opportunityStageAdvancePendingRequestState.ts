import { type OpportunityStageAdvancePendingRequest } from '@/object-record/record-persistence-gate/types/OpportunityStageAdvancePendingRequest';
import { atom } from 'jotai';

export const opportunityStageAdvancePendingRequestState =
  atom<OpportunityStageAdvancePendingRequest | null>(null);
opportunityStageAdvancePendingRequestState.debugLabel =
  'opportunityStageAdvancePendingRequestState';
