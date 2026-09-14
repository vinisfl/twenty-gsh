import { getKanbanNextActionUrgency } from '@/object-record/record-board/record-board-card/utils/getKanbanNextActionUrgency';

describe('getKanbanNextActionUrgency', () => {
  const now = new Date(2026, 8, 14, 12);

  it.each([
    ['Call client', '2026-09-13T12:00:00.000Z', 'OVERDUE'],
    ['Send proposal', '2026-09-14T18:00:00.000Z', 'TODAY'],
    [undefined, undefined, 'NO_NEXT_ACTION'],
    ['Prepare budget', undefined, 'NO_DUE_DATE'],
    ['Confirm venue', '2026-09-15T12:00:00.000Z', 'UPCOMING'],
  ] as const)(
    'classifies %s due %s as %s',
    (nextAction, nextActionAt, expectedUrgency) => {
      expect(
        getKanbanNextActionUrgency({ nextAction, nextActionAt, now }),
      ).toBe(expectedUrgency);
    },
  );
});
