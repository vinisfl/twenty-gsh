import { isDefined } from 'twenty-shared/utils';

import { type GateRequirementCheckResult } from '@/object-record/record-persistence-gate/types/GateRequirementCheckResult';
import { type MonetaryAmountDraft } from '@/object-record/record-persistence-gate/types/MonetaryAmountDraft';
import { buildGateRequirementCheckResult } from '@/object-record/record-persistence-gate/utils/buildGateRequirementCheckResult';
import { isFilled } from '@/object-record/record-persistence-gate/utils/isFilled';

export type ProposalToAcceptanceGateRequirementKey =
  | 'proposalAccepted'
  | 'closedAmount'
  | 'acceptanceEvidence';

type ProposalToAcceptanceGateOpportunity = {
  eventClosedAmount: MonetaryAmountDraft | null | undefined;
  eventAcceptanceEvidence: string | null | undefined;
};

type ProposalToAcceptanceGateProposal = {
  status: string | null | undefined;
};

export const getProposalToAcceptanceGateRequirements = ({
  opportunity,
  latestProposal,
}: {
  opportunity: ProposalToAcceptanceGateOpportunity | null | undefined;
  latestProposal: ProposalToAcceptanceGateProposal | null | undefined;
}): GateRequirementCheckResult<ProposalToAcceptanceGateRequirementKey> =>
  buildGateRequirementCheckResult<ProposalToAcceptanceGateRequirementKey>({
    proposalAccepted: latestProposal?.status === 'ACCEPTED',
    closedAmount: isDefined(opportunity?.eventClosedAmount),
    acceptanceEvidence: isFilled(opportunity?.eventAcceptanceEvidence),
  });
