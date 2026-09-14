import { createContext } from 'react';

import { type OpportunityStageReadiness } from '@/object-record/record-persistence-gate/utils/getOpportunityStageReadiness';

type OpportunityStageReadinessContextValue = {
  readinessByOpportunityId: ReadonlyMap<string, OpportunityStageReadiness>;
};

export const OpportunityStageReadinessContext =
  createContext<OpportunityStageReadinessContextValue>({
    readinessByOpportunityId: new Map(),
  });
