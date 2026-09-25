import { buildGateRequirementCheckResult } from '@/object-record/record-persistence-gate/utils/buildGateRequirementCheckResult';

describe('buildGateRequirementCheckResult', () => {
  it('is satisfied and lists every key as met when all requirements are met', () => {
    expect(
      buildGateRequirementCheckResult({ eventType: true, location: true }),
    ).toEqual({
      isSatisfied: true,
      metRequirementKeys: ['eventType', 'location'],
      missingRequirementKeys: [],
    });
  });

  it('is not satisfied and lists every key as missing when none are met', () => {
    expect(
      buildGateRequirementCheckResult({ eventType: false, location: false }),
    ).toEqual({
      isSatisfied: false,
      metRequirementKeys: [],
      missingRequirementKeys: ['eventType', 'location'],
    });
  });

  it('splits keys between met and missing when only some requirements are met', () => {
    expect(
      buildGateRequirementCheckResult({ eventType: true, location: false }),
    ).toEqual({
      isSatisfied: false,
      metRequirementKeys: ['eventType'],
      missingRequirementKeys: ['location'],
    });
  });
});
