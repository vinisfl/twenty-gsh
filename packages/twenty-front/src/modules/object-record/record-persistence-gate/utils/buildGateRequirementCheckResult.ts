import { type GateRequirementCheckResult } from '@/object-record/record-persistence-gate/types/GateRequirementCheckResult';

export const buildGateRequirementCheckResult = <TRequirementKey extends string>(
  isRequirementMetByKey: Record<TRequirementKey, boolean>,
): GateRequirementCheckResult<TRequirementKey> => {
  const entries = Object.entries(isRequirementMetByKey) as [
    TRequirementKey,
    boolean,
  ][];

  return {
    isSatisfied: entries.every(([, isMet]) => isMet),
    metRequirementKeys: entries
      .filter(([, isMet]) => isMet)
      .map(([key]) => key),
    missingRequirementKeys: entries
      .filter(([, isMet]) => !isMet)
      .map(([key]) => key),
  };
};
