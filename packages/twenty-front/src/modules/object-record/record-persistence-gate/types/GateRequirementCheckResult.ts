// Single source of truth for "what's filled vs. missing" on a stage-advance
// gate. Any surface (a gate modal, a Kanban card indicator, …) reads the
// same result instead of recomputing the rule.
export type GateRequirementCheckResult<TRequirementKey extends string> = {
  isSatisfied: boolean;
  metRequirementKeys: TRequirementKey[];
  missingRequirementKeys: TRequirementKey[];
};
