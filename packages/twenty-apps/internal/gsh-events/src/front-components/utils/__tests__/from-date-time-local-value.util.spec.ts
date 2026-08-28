import { describe, expect, it } from 'vitest';
import { fromDateTimeLocalValue } from 'src/front-components/utils/from-date-time-local-value.util';

describe('fromDateTimeLocalValue', () => {
  it('returns an ISO timestamp and preserves empty values', () => {
    expect(fromDateTimeLocalValue('')).toBeUndefined();
    expect(fromDateTimeLocalValue('2026-09-10T18:30')).toMatch(/^2026-09-10T/);
  });
});
