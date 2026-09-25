import { getGateFieldStatus } from '@/object-record/record-persistence-gate/utils/getGateFieldStatus';

describe('getGateFieldStatus', () => {
  it.each([
    [{ isSatisfied: false, isInherited: false }, 'pending'],
    [{ isSatisfied: false, isInherited: true }, 'pending'],
    [{ isSatisfied: true, isInherited: false }, 'filled'],
    [{ isSatisfied: true, isInherited: true }, 'inherited'],
  ] as const)('returns %s for %o', (input, expectedStatus) => {
    expect(getGateFieldStatus(input)).toBe(expectedStatus);
  });
});
