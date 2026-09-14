import { getProductionToClosedGateRequirements } from '@/object-record/record-persistence-gate/utils/getProductionToClosedGateRequirements';

describe('getProductionToClosedGateRequirements', () => {
  it('is satisfied when the contract is signed, execution is completed and the checklist is ready', () => {
    const result = getProductionToClosedGateRequirements({
      opportunity: { contractStatus: 'SIGNED' },
      corporateEvent: {
        executionStatus: 'COMPLETED',
        assemblyStatus: 'READY',
        travelStatus: 'NOT_APPLICABLE',
        supplyStatus: 'READY',
        teamStatus: 'READY',
      },
    });

    expect(result).toEqual({
      isSatisfied: true,
      metRequirementKeys: [
        'contractSigned',
        'executionCompleted',
        'assemblyReady',
        'travelReady',
        'supplyReady',
        'teamReady',
      ],
      missingRequirementKeys: [],
    });
  });

  it('is not satisfied and lists everything missing when there is no data', () => {
    const result = getProductionToClosedGateRequirements({
      opportunity: undefined,
      corporateEvent: undefined,
    });

    expect(result).toEqual({
      isSatisfied: false,
      metRequirementKeys: [],
      missingRequirementKeys: [
        'contractSigned',
        'executionCompleted',
        'assemblyReady',
        'travelReady',
        'supplyReady',
        'teamReady',
      ],
    });
  });

  it('lists only the missing checklist items when partially ready', () => {
    const result = getProductionToClosedGateRequirements({
      opportunity: { contractStatus: 'SIGNED' },
      corporateEvent: {
        executionStatus: 'IN_PROGRESS',
        assemblyStatus: 'READY',
        travelStatus: 'PENDING',
        supplyStatus: 'NOT_APPLICABLE',
        teamStatus: 'PENDING',
      },
    });

    expect(result).toEqual({
      isSatisfied: false,
      metRequirementKeys: ['contractSigned', 'assemblyReady', 'supplyReady'],
      missingRequirementKeys: [
        'executionCompleted',
        'travelReady',
        'teamReady',
      ],
    });
  });
});
