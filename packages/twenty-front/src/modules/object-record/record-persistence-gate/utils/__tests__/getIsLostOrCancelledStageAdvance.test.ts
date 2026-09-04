import { getIsLostOrCancelledStageAdvance } from '@/object-record/record-persistence-gate/utils/getIsLostOrCancelledStageAdvance';

describe('getIsLostOrCancelledStageAdvance', () => {
  it.each([
    ['ENTRY', 'LOST'],
    ['QUALIFICATION', 'LOST'],
    ['PROPOSAL_NEGOTIATION', 'CANCELLED'],
    ['ACCEPTANCE_REGISTRATION', 'CANCELLED'],
    ['PRODUCTION_FORMALIZATION_EVENT', 'LOST'],
    ['CLOSED', 'CANCELLED'],
  ])(
    'identifies the gated transition from any origin stage (%s -> %s)',
    (sourceStageValue, destinationStageValue) => {
      expect(
        getIsLostOrCancelledStageAdvance({
          sourceStageValue,
          destinationStageValue,
        }),
      ).toBe(true);
    },
  );

  it.each([
    ['QUALIFICATION', 'PROPOSAL_NEGOTIATION'],
    ['LOST', 'LOST'],
    ['CANCELLED', 'CANCELLED'],
    ['ENTRY', null],
    [null, null],
  ])(
    'does not identify unrelated transitions (%s -> %s)',
    (sourceStageValue, destinationStageValue) => {
      expect(
        getIsLostOrCancelledStageAdvance({
          sourceStageValue,
          destinationStageValue,
        }),
      ).toBe(false);
    },
  );
});
