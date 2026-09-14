import { type MonetaryAmountDraft } from '@/object-record/record-persistence-gate/types/MonetaryAmountDraft';
import { getAcceptanceToProductionGateRequirements } from '@/object-record/record-persistence-gate/utils/getAcceptanceToProductionGateRequirements';
import { getProductionToClosedGateRequirements } from '@/object-record/record-persistence-gate/utils/getProductionToClosedGateRequirements';
import { getProposalToAcceptanceGateRequirements } from '@/object-record/record-persistence-gate/utils/getProposalToAcceptanceGateRequirements';
import { getQualificationToProposalGateRequirements } from '@/object-record/record-persistence-gate/utils/getQualificationToProposalGateRequirements';

export type OpportunityStageReadiness = {
  isReadyToAdvance: boolean;
  missingRequirementCount: number;
};

type OpportunityStageReadinessOpportunity = {
  eventProcessStage: string | null | undefined;
  eventAudience?: number | null | undefined;
  eventLocation?: string | null | undefined;
  eventAt?: string | null | undefined;
  amount?: MonetaryAmountDraft | null | undefined;
  eventBudgetCompatible?: boolean | null | undefined;
  eventClosedAmount?: MonetaryAmountDraft | null | undefined;
  eventAcceptanceEvidence?: string | null | undefined;
  contractStatus?: string | null | undefined;
};

type OpportunityStageReadinessCorporateEvent = {
  eventType?: string | null | undefined;
  city?: string | null | undefined;
  executionStatus?: string | null | undefined;
  assemblyStatus?: string | null | undefined;
  travelStatus?: string | null | undefined;
  supplyStatus?: string | null | undefined;
  teamStatus?: string | null | undefined;
};

type OpportunityStageReadinessProposal = {
  status?: string | null | undefined;
};

type OpportunityStageReadinessCompany = {
  legalName?: string | null | undefined;
  taxId?: string | null | undefined;
  billingEmail?: string | null | undefined;
};

const toOpportunityStageReadiness = ({
  isSatisfied,
  missingRequirementKeys,
}: {
  isSatisfied: boolean;
  missingRequirementKeys: string[];
}): OpportunityStageReadiness => ({
  isReadyToAdvance: isSatisfied,
  missingRequirementCount: missingRequirementKeys.length,
});

export const getOpportunityStageReadiness = ({
  opportunity,
  corporateEvent,
  latestProposal,
  company,
}: {
  opportunity: OpportunityStageReadinessOpportunity | null | undefined;
  corporateEvent?: OpportunityStageReadinessCorporateEvent | null | undefined;
  latestProposal?: OpportunityStageReadinessProposal | null | undefined;
  company?: OpportunityStageReadinessCompany | null | undefined;
}): OpportunityStageReadiness | null => {
  switch (opportunity?.eventProcessStage) {
    case 'ENTRY':
      return { isReadyToAdvance: true, missingRequirementCount: 0 };
    case 'QUALIFICATION':
      return toOpportunityStageReadiness(
        getQualificationToProposalGateRequirements({
          opportunity: {
            eventAudience: opportunity?.eventAudience,
            eventLocation: opportunity?.eventLocation,
            eventAt: opportunity?.eventAt,
            amount: opportunity?.amount,
            eventBudgetCompatible: opportunity?.eventBudgetCompatible,
          },
          corporateEvent: {
            eventType: corporateEvent?.eventType,
            city: corporateEvent?.city,
          },
        }),
      );
    case 'PROPOSAL_NEGOTIATION':
      return toOpportunityStageReadiness(
        getProposalToAcceptanceGateRequirements({
          opportunity: {
            eventClosedAmount: opportunity?.eventClosedAmount,
            eventAcceptanceEvidence: opportunity?.eventAcceptanceEvidence,
          },
          latestProposal: { status: latestProposal?.status },
        }),
      );
    case 'ACCEPTANCE_REGISTRATION':
      return toOpportunityStageReadiness(
        getAcceptanceToProductionGateRequirements({
          opportunity: {
            eventClosedAmount: opportunity?.eventClosedAmount,
            eventAcceptanceEvidence: opportunity?.eventAcceptanceEvidence,
          },
          company: {
            legalName: company?.legalName,
            taxId: company?.taxId,
            billingEmail: company?.billingEmail,
          },
        }),
      );
    case 'PRODUCTION_FORMALIZATION_EVENT':
      return toOpportunityStageReadiness(
        getProductionToClosedGateRequirements({
          opportunity: { contractStatus: opportunity?.contractStatus },
          corporateEvent: {
            executionStatus: corporateEvent?.executionStatus,
            assemblyStatus: corporateEvent?.assemblyStatus,
            travelStatus: corporateEvent?.travelStatus,
            supplyStatus: corporateEvent?.supplyStatus,
            teamStatus: corporateEvent?.teamStatus,
          },
        }),
      );
    case 'CLOSED':
    case 'LOST':
    case 'CANCELLED':
    default:
      return null;
  }
};
