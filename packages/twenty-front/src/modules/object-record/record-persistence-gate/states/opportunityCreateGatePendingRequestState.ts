import { type OpportunityCreateGatePendingRequest } from '@/object-record/record-persistence-gate/types/OpportunityCreateGatePendingRequest';
import { atom } from 'jotai';

export const opportunityCreateGatePendingRequestState =
  atom<OpportunityCreateGatePendingRequest | null>(null);
opportunityCreateGatePendingRequestState.debugLabel =
  'opportunityCreateGatePendingRequestState';
