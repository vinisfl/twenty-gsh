import { describe, expect, it } from 'vitest';
import { getStepStatus } from 'src/front-components/utils/get-step-status.util';

describe('getStepStatus', () => {
  it('marks steps before the current one as completed', () => {
    expect(getStepStatus(0, 2)).toBe('completed');
    expect(getStepStatus(1, 2)).toBe('completed');
  });

  it('marks the current index as current', () => {
    expect(getStepStatus(2, 2)).toBe('current');
  });

  it('marks steps after the current one as upcoming', () => {
    expect(getStepStatus(3, 2)).toBe('upcoming');
    expect(getStepStatus(4, 2)).toBe('upcoming');
  });

  it('treats an unresolved stage (-1) as all upcoming', () => {
    expect(getStepStatus(0, -1)).toBe('upcoming');
    expect(getStepStatus(4, -1)).toBe('upcoming');
  });
});
