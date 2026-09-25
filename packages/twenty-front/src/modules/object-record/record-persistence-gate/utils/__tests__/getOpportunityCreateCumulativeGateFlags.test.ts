import { getOpportunityCreateCumulativeGateFlags } from '@/object-record/record-persistence-gate/utils/getOpportunityCreateCumulativeGateFlags';

describe('getOpportunityCreateCumulativeGateFlags', () => {
  it('requires no extra fields when created without a destination stage', () => {
    expect(getOpportunityCreateCumulativeGateFlags(undefined)).toEqual({
      requiresQualificationFields: false,
      requiresAcceptanceFields: false,
      requiresProductionFields: false,
    });
  });

  it.each(['ENTRY', 'QUALIFICATION'])(
    'requires no extra fields when created in %s',
    (stage) => {
      expect(getOpportunityCreateCumulativeGateFlags(stage)).toEqual({
        requiresQualificationFields: false,
        requiresAcceptanceFields: false,
        requiresProductionFields: false,
      });
    },
  );

  it('requires only the qualification gate fields when created in Proposta e negociação', () => {
    expect(
      getOpportunityCreateCumulativeGateFlags('PROPOSAL_NEGOTIATION'),
    ).toEqual({
      requiresQualificationFields: true,
      requiresAcceptanceFields: false,
      requiresProductionFields: false,
    });
  });

  it('requires the qualification and acceptance gate fields when created in Aceite e cadastro', () => {
    expect(
      getOpportunityCreateCumulativeGateFlags('ACCEPTANCE_REGISTRATION'),
    ).toEqual({
      requiresQualificationFields: true,
      requiresAcceptanceFields: true,
      requiresProductionFields: false,
    });
  });

  it('requires every gate field when created in Produção/formalização', () => {
    expect(
      getOpportunityCreateCumulativeGateFlags('PRODUCTION_FORMALIZATION_EVENT'),
    ).toEqual({
      requiresQualificationFields: true,
      requiresAcceptanceFields: true,
      requiresProductionFields: true,
    });
  });
});
