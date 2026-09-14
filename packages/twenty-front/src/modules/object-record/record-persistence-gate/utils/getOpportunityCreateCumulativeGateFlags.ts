import { isDefined } from 'twenty-shared/utils';

export type OpportunityCreateCumulativeGateFlags = {
  requiresQualificationFields: boolean;
  requiresAcceptanceFields: boolean;
  requiresProductionFields: boolean;
};

// GSH-specific: creating an Opportunity directly in a column past the entry
// stage must ask, cumulatively, for the required fields of every stage-advance
// gate it skipped past (see guided-funnel-journey-spec.md, "Criação"). Rank
// mirrors EVENT_PROCESS_STAGE_OPTIONS' position in the gsh-events app.
const DESTINATION_STAGE_RANK: Record<string, number> = {
  PROPOSAL_NEGOTIATION: 2,
  ACCEPTANCE_REGISTRATION: 3,
  PRODUCTION_FORMALIZATION_EVENT: 4,
};

export const getOpportunityCreateCumulativeGateFlags = (
  destinationStageValue: string | null | undefined,
): OpportunityCreateCumulativeGateFlags => {
  const rank = isDefined(destinationStageValue)
    ? (DESTINATION_STAGE_RANK[destinationStageValue] ?? 0)
    : 0;

  return {
    requiresQualificationFields: rank >= 2,
    requiresAcceptanceFields: rank >= 3,
    requiresProductionFields: rank >= 4,
  };
};
