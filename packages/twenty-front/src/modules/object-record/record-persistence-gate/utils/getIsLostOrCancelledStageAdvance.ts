export const getIsLostOrCancelledStageAdvance = ({
  sourceStageValue,
  destinationStageValue,
}: {
  sourceStageValue: string | null;
  destinationStageValue: string | null;
}): boolean =>
  (destinationStageValue === 'LOST' || destinationStageValue === 'CANCELLED') &&
  sourceStageValue !== destinationStageValue;
