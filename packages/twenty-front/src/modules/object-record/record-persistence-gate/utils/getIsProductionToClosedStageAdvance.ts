export const getIsProductionToClosedStageAdvance = ({
  sourceStageValue,
  destinationStageValue,
}: {
  sourceStageValue: string | null;
  destinationStageValue: string | null;
}): boolean =>
  sourceStageValue === 'PRODUCTION_FORMALIZATION_EVENT' &&
  destinationStageValue === 'CLOSED';
