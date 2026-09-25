export const getIsProposalToAcceptanceStageAdvance = ({
  sourceStageValue,
  destinationStageValue,
}: {
  sourceStageValue: string | null;
  destinationStageValue: string | null;
}): boolean =>
  sourceStageValue === 'PROPOSAL_NEGOTIATION' &&
  destinationStageValue === 'ACCEPTANCE_REGISTRATION';
