import { fromDateTimeLocalInputValue } from '@/object-record/record-persistence-gate/utils/fromDateTimeLocalInputValue';

describe('fromDateTimeLocalInputValue', () => {
  it('should return null for an empty value', () => {
    expect(fromDateTimeLocalInputValue('')).toBe(null);
  });

  it('should convert a datetime-local value to an ISO instant string', () => {
    const result = fromDateTimeLocalInputValue('2026-09-10T14:30');

    expect(result).toBe(new Date('2026-09-10T14:30').toISOString());
  });
});
