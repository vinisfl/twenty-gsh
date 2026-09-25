import { getIsAcceptanceToProductionStageAdvance } from '@/object-record/record-persistence-gate/utils/getIsAcceptanceToProductionStageAdvance';

describe('getIsAcceptanceToProductionStageAdvance', () => {
  it('identifies the gated acceptance-to-production transition', () => {
    expect(
      getIsAcceptanceToProductionStageAdvance({
        sourceStageValue: 'ACCEPTANCE_REGISTRATION',
        destinationStageValue: 'PRODUCTION_FORMALIZATION_EVENT',
      }),
    ).toBe(true);
  });

  it.each([
    ['PROPOSAL_NEGOTIATION', 'ACCEPTANCE_REGISTRATION'],
    ['PRODUCTION_FORMALIZATION_EVENT', 'ACCEPTANCE_REGISTRATION'],
    ['ACCEPTANCE_REGISTRATION', 'CLOSED'],
    [null, 'PRODUCTION_FORMALIZATION_EVENT'],
  ])(
    'does not identify unrelated transitions (%s -> %s)',
    (sourceStageValue, destinationStageValue) => {
      expect(
        getIsAcceptanceToProductionStageAdvance({
          sourceStageValue,
          destinationStageValue,
        }),
      ).toBe(false);
    },
  );
});
