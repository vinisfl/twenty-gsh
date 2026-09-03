import { toDateTimeLocalInputValue } from '@/object-record/record-persistence-gate/utils/toDateTimeLocalInputValue';

describe('toDateTimeLocalInputValue', () => {
  it('should return an empty string for null', () => {
    expect(toDateTimeLocalInputValue(null)).toBe('');
  });

  it('should round-trip a value produced by fromDateTimeLocalInputValue', () => {
    const isoValue = new Date('2026-09-10T14:30').toISOString();

    expect(toDateTimeLocalInputValue(isoValue)).toBe('2026-09-10T14:30');
  });
});
