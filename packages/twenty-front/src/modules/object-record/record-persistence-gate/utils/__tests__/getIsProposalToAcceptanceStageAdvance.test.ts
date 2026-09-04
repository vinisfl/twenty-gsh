import { getIsProposalToAcceptanceStageAdvance } from '@/object-record/record-persistence-gate/utils/getIsProposalToAcceptanceStageAdvance';

describe('getIsProposalToAcceptanceStageAdvance', () => {
  it('identifies the gated proposal-to-acceptance transition', () => {
    expect(
      getIsProposalToAcceptanceStageAdvance({
        sourceStageValue: 'PROPOSAL_NEGOTIATION',
        destinationStageValue: 'ACCEPTANCE_REGISTRATION',
      }),
    ).toBe(true);
  });

  it.each([
    ['QUALIFICATION', 'PROPOSAL_NEGOTIATION'],
    ['ACCEPTANCE_REGISTRATION', 'PROPOSAL_NEGOTIATION'],
    ['PROPOSAL_NEGOTIATION', 'PRODUCTION_FORMALIZATION_EVENT'],
    [null, 'ACCEPTANCE_REGISTRATION'],
  ])(
    'does not identify unrelated transitions (%s -> %s)',
    (sourceStageValue, destinationStageValue) => {
      expect(
        getIsProposalToAcceptanceStageAdvance({
          sourceStageValue,
          destinationStageValue,
        }),
      ).toBe(false);
    },
  );
});
