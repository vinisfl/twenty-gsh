import { isDefined } from 'twenty-shared/utils';

import { type GateRequirementCheckResult } from '@/object-record/record-persistence-gate/types/GateRequirementCheckResult';
import { type MonetaryAmountDraft } from '@/object-record/record-persistence-gate/types/MonetaryAmountDraft';
import { buildGateRequirementCheckResult } from '@/object-record/record-persistence-gate/utils/buildGateRequirementCheckResult';
import { isFilled } from '@/object-record/record-persistence-gate/utils/isFilled';

export type AcceptanceToProductionGateRequirementKey =
  | 'closedAmount'
  | 'acceptanceEvidence'
  | 'legalName'
  | 'taxId'
  | 'billingEmail';

type AcceptanceToProductionGateOpportunity = {
  eventClosedAmount: MonetaryAmountDraft | null | undefined;
  eventAcceptanceEvidence: string | null | undefined;
};

type AcceptanceToProductionGateCompany = {
  legalName: string | null | undefined;
  taxId: string | null | undefined;
  billingEmail: string | null | undefined;
};

export const getAcceptanceToProductionGateRequirements = ({
  opportunity,
  company,
}: {
  opportunity: AcceptanceToProductionGateOpportunity | null | undefined;
  company: AcceptanceToProductionGateCompany | null | undefined;
}): GateRequirementCheckResult<AcceptanceToProductionGateRequirementKey> =>
  buildGateRequirementCheckResult<AcceptanceToProductionGateRequirementKey>({
    closedAmount: isDefined(opportunity?.eventClosedAmount),
    acceptanceEvidence: isFilled(opportunity?.eventAcceptanceEvidence),
    legalName: isFilled(company?.legalName),
    taxId: isFilled(company?.taxId),
    billingEmail: isFilled(company?.billingEmail),
  });
