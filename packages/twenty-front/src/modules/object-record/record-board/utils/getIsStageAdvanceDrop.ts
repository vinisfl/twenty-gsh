export const getIsStageAdvanceDrop = ({
  sourceGroupPosition,
  destinationGroupPosition,
}: {
  sourceGroupPosition: number;
  destinationGroupPosition: number;
}): boolean => destinationGroupPosition > sourceGroupPosition;
