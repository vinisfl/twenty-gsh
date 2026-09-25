import { getIsQualificationToProposalStageAdvance } from '@/object-record/record-persistence-gate/utils/getIsQualificationToProposalStageAdvance';

describe('getIsQualificationToProposalStageAdvance', () => {
  it('identifies the gated qualification-to-proposal transition', () => {
    expect(
      getIsQualificationToProposalStageAdvance({
        sourceStageValue: 'QUALIFICATION',
        destinationStageValue: 'PROPOSAL_NEGOTIATION',
      }),
    ).toBe(true);
  });

  it.each([
    ['ENTRY', 'QUALIFICATION'],
    ['PROPOSAL_NEGOTIATION', 'QUALIFICATION'],
    ['QUALIFICATION', 'ACCEPTANCE_REGISTRATION'],
    [null, 'PROPOSAL_NEGOTIATION'],
  ])(
    'does not identify unrelated transitions (%s -> %s)',
    (sourceStageValue, destinationStageValue) => {
      expect(
        getIsQualificationToProposalStageAdvance({
          sourceStageValue,
          destinationStageValue,
        }),
      ).toBe(false);
    },
  );
});
