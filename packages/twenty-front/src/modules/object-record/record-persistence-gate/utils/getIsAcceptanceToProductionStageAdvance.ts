export const getIsAcceptanceToProductionStageAdvance = ({
  sourceStageValue,
  destinationStageValue,
}: {
  sourceStageValue: string | null;
  destinationStageValue: string | null;
}): boolean =>
  sourceStageValue === 'ACCEPTANCE_REGISTRATION' &&
  destinationStageValue === 'PRODUCTION_FORMALIZATION_EVENT';
