export const getIsQualificationToProposalStageAdvance = ({
  sourceStageValue,
  destinationStageValue,
}: {
  sourceStageValue: string | null;
  destinationStageValue: string | null;
}): boolean =>
  sourceStageValue === 'QUALIFICATION' &&
  destinationStageValue === 'PROPOSAL_NEGOTIATION';
