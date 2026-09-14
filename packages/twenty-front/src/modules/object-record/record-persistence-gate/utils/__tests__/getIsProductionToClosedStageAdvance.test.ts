import { getIsProductionToClosedStageAdvance } from '@/object-record/record-persistence-gate/utils/getIsProductionToClosedStageAdvance';

describe('getIsProductionToClosedStageAdvance', () => {
  it('identifies the gated production-to-closed transition', () => {
    expect(
      getIsProductionToClosedStageAdvance({
        sourceStageValue: 'PRODUCTION_FORMALIZATION_EVENT',
        destinationStageValue: 'CLOSED',
      }),
    ).toBe(true);
  });

  it.each([
    ['ACCEPTANCE_REGISTRATION', 'PRODUCTION_FORMALIZATION_EVENT'],
    ['CLOSED', 'PRODUCTION_FORMALIZATION_EVENT'],
    ['PRODUCTION_FORMALIZATION_EVENT', 'LOST'],
    [null, 'CLOSED'],
  ])(
    'does not identify unrelated transitions (%s -> %s)',
    (sourceStageValue, destinationStageValue) => {
      expect(
        getIsProductionToClosedStageAdvance({
          sourceStageValue,
          destinationStageValue,
        }),
      ).toBe(false);
    },
  );
});
