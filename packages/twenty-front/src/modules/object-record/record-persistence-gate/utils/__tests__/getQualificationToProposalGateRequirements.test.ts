import { getQualificationToProposalGateRequirements } from '@/object-record/record-persistence-gate/utils/getQualificationToProposalGateRequirements';

describe('getQualificationToProposalGateRequirements', () => {
  it('is satisfied when every field is filled', () => {
    const result = getQualificationToProposalGateRequirements({
      opportunity: {
        eventAudience: 120,
        eventLocation: 'Salão Jardim',
        eventAt: '2026-10-01T18:00:00.000Z',
        amount: { amountMicros: 15_000_000_000 },
        eventBudgetCompatible: true,
      },
      corporateEvent: { eventType: 'COCKTAIL', city: 'São Paulo' },
    });

    expect(result).toEqual({
      isSatisfied: true,
      metRequirementKeys: [
        'eventType',
        'audience',
        'location',
        'city',
        'eventAt',
        'amount',
        'budgetCompatible',
      ],
      missingRequirementKeys: [],
    });
  });

  it('is not satisfied and lists every field missing when nothing is filled', () => {
    const result = getQualificationToProposalGateRequirements({
      opportunity: undefined,
      corporateEvent: undefined,
    });

    expect(result).toEqual({
      isSatisfied: false,
      metRequirementKeys: [],
      missingRequirementKeys: [
        'eventType',
        'audience',
        'location',
        'city',
        'eventAt',
        'amount',
        'budgetCompatible',
      ],
    });
  });

  it('lists only the missing fields when partially filled', () => {
    const result = getQualificationToProposalGateRequirements({
      opportunity: {
        eventAudience: 0,
        eventLocation: 'Salão Jardim',
        eventAt: '',
        amount: { amountMicros: 15_000_000_000 },
        eventBudgetCompatible: false,
      },
      corporateEvent: { eventType: 'COCKTAIL', city: '' },
    });

    expect(result).toEqual({
      isSatisfied: false,
      metRequirementKeys: ['eventType', 'location', 'amount'],
      missingRequirementKeys: [
        'audience',
        'city',
        'eventAt',
        'budgetCompatible',
      ],
    });
  });
});
