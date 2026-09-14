import { getAcceptanceToProductionGateRequirements } from '@/object-record/record-persistence-gate/utils/getAcceptanceToProductionGateRequirements';

describe('getAcceptanceToProductionGateRequirements', () => {
  it('is satisfied when the opportunity and company data are filled', () => {
    const result = getAcceptanceToProductionGateRequirements({
      opportunity: {
        eventClosedAmount: { amountMicros: 15_000_000_000 },
        eventAcceptanceEvidence: 'https://mail.example.com/aceite-cliente',
      },
      company: {
        legalName: 'Gourmet e Companhia LTDA',
        taxId: '12.345.678/0001-90',
        billingEmail: 'faturamento@cliente.com',
      },
    });

    expect(result).toEqual({
      isSatisfied: true,
      metRequirementKeys: [
        'closedAmount',
        'acceptanceEvidence',
        'legalName',
        'taxId',
        'billingEmail',
      ],
      missingRequirementKeys: [],
    });
  });

  it('is not satisfied and lists everything missing when there is no data', () => {
    const result = getAcceptanceToProductionGateRequirements({
      opportunity: undefined,
      company: undefined,
    });

    expect(result).toEqual({
      isSatisfied: false,
      metRequirementKeys: [],
      missingRequirementKeys: [
        'closedAmount',
        'acceptanceEvidence',
        'legalName',
        'taxId',
        'billingEmail',
      ],
    });
  });

  it('lists only the missing fiscal fields when the company is partially filled', () => {
    const result = getAcceptanceToProductionGateRequirements({
      opportunity: {
        eventClosedAmount: { amountMicros: 15_000_000_000 },
        eventAcceptanceEvidence: 'https://mail.example.com/aceite-cliente',
      },
      company: {
        legalName: null,
        taxId: '12.345.678/0001-90',
        billingEmail: null,
      },
    });

    expect(result).toEqual({
      isSatisfied: false,
      metRequirementKeys: ['closedAmount', 'acceptanceEvidence', 'taxId'],
      missingRequirementKeys: ['legalName', 'billingEmail'],
    });
  });
});
