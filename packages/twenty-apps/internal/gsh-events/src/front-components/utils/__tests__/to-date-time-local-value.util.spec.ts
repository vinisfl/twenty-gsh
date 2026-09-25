import { describe, expect, it } from 'vitest';
import { toDateTimeLocalValue } from 'src/front-components/utils/to-date-time-local-value.util';

describe('toDateTimeLocalValue', () => {
  it('keeps empty and invalid values empty', () => {
    expect(toDateTimeLocalValue(undefined)).toBe('');
    expect(toDateTimeLocalValue('invalid')).toBe('');
  });
});
