// Returning true lets the native stage update proceed; false means the
// handler has taken over (e.g. opened its own blocking modal) and the
// native update must not run.
export type OpportunityStageAdvanceGateHandler = (params: {
  recordId: string;
  sourceStageValue: string | null;
  destinationStageValue: string | null;
}) => boolean;
