import { getOpportunityStageReadiness } from '@/object-record/record-persistence-gate/utils/getOpportunityStageReadiness';

describe('getOpportunityStageReadiness', () => {
  it('reports the qualification gate requirements for an opportunity in qualification', () => {
    expect(
      getOpportunityStageReadiness({
        opportunity: {
          eventProcessStage: 'QUALIFICATION',
          eventAudience: 50,
          eventLocation: 'Hotel Central',
          eventAt: '2026-10-21T18:00:00.000Z',
          amount: { amountMicros: 10_000_000 },
          eventBudgetCompatible: true,
        },
        corporateEvent: { eventType: 'COCKTAIL', city: '' },
      }),
    ).toEqual({
      isReadyToAdvance: false,
      missingRequirementCount: 1,
    });
  });

  it('reports a ready state when the next advance has no gate', () => {
    expect(
      getOpportunityStageReadiness({
        opportunity: { eventProcessStage: 'ENTRY' },
      }),
    ).toEqual({
      isReadyToAdvance: true,
      missingRequirementCount: 0,
    });
  });

  it('treats an internal arena as ready without a separately stored city', () => {
    expect(
      getOpportunityStageReadiness({
        opportunity: {
          eventProcessStage: 'QUALIFICATION',
          eventModality: 'INTERNAL',
          eventAudience: 50,
          eventLocation: 'Morumbis',
          eventAt: '2026-10-21T18:00:00.000Z',
        },
        corporateEvent: { eventType: 'COCKTAIL', city: '' },
      }),
    ).toEqual({
      isReadyToAdvance: true,
      missingRequirementCount: 0,
    });
  });

  it('uses the latest proposal when checking readiness for acceptance', () => {
    expect(
      getOpportunityStageReadiness({
        opportunity: {
          eventProcessStage: 'PROPOSAL_NEGOTIATION',
          eventClosedAmount: { amountMicros: 10_000_000 },
          eventAcceptanceEvidence: 'Email de aceite',
        },
        latestProposal: { status: 'ACCEPTED' },
      }),
    ).toEqual({
      isReadyToAdvance: true,
      missingRequirementCount: 0,
    });
  });

  it('uses company data when checking readiness for production', () => {
    expect(
      getOpportunityStageReadiness({
        opportunity: {
          eventProcessStage: 'ACCEPTANCE_REGISTRATION',
          eventClosedAmount: { amountMicros: 10_000_000 },
          eventAcceptanceEvidence: 'Email de aceite',
        },
        company: {
          legalName: 'Gourmet Eventos LTDA',
          taxId: '12.345.678/0001-90',
          billingEmail: 'financeiro@gourmet.com',
        },
      }),
    ).toEqual({
      isReadyToAdvance: true,
      missingRequirementCount: 0,
    });
  });

  it('uses the event checklist when checking readiness for closure', () => {
    expect(
      getOpportunityStageReadiness({
        opportunity: {
          eventProcessStage: 'PRODUCTION_FORMALIZATION_EVENT',
          contractStatus: 'SIGNED',
        },
        corporateEvent: {
          executionStatus: 'COMPLETED',
          assemblyStatus: 'READY',
          travelStatus: 'READY',
          supplyStatus: 'READY',
          teamStatus: 'READY',
        },
      }),
    ).toEqual({
      isReadyToAdvance: true,
      missingRequirementCount: 0,
    });
  });

  it('does not report readiness after an opportunity reaches a terminal stage', () => {
    expect(
      getOpportunityStageReadiness({
        opportunity: { eventProcessStage: 'CLOSED' },
      }),
    ).toBeNull();
  });
});
