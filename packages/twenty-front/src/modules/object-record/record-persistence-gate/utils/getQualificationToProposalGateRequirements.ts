import { isDefined } from 'twenty-shared/utils';

import { type GateRequirementCheckResult } from '@/object-record/record-persistence-gate/types/GateRequirementCheckResult';
import { type MonetaryAmountDraft } from '@/object-record/record-persistence-gate/types/MonetaryAmountDraft';
import { buildGateRequirementCheckResult } from '@/object-record/record-persistence-gate/utils/buildGateRequirementCheckResult';
import { isFilled } from '@/object-record/record-persistence-gate/utils/isFilled';

export type QualificationToProposalGateRequirementKey =
  | 'eventType'
  | 'audience'
  | 'location'
  | 'city'
  | 'eventAt'
  | 'amount';

type QualificationToProposalGateOpportunity = {
  eventAudience: number | null | undefined;
  eventLocation: string | null | undefined;
  eventAt: string | null | undefined;
  amount: MonetaryAmountDraft | null | undefined;
};

type QualificationToProposalGateCorporateEvent = {
  eventType: string | null | undefined;
  city: string | null | undefined;
};

export const getQualificationToProposalGateRequirements = ({
  opportunity,
  corporateEvent,
}: {
  opportunity: QualificationToProposalGateOpportunity | null | undefined;
  corporateEvent: QualificationToProposalGateCorporateEvent | null | undefined;
}): GateRequirementCheckResult<QualificationToProposalGateRequirementKey> => {
  const audience = opportunity?.eventAudience;
  const amountMicros = opportunity?.amount?.amountMicros;

  return buildGateRequirementCheckResult<QualificationToProposalGateRequirementKey>(
    {
      eventType: isFilled(corporateEvent?.eventType),
      audience:
        typeof audience === 'number' &&
        Number.isInteger(audience) &&
        audience > 0,
      location: isFilled(opportunity?.eventLocation),
      city: isFilled(corporateEvent?.city),
      eventAt: isFilled(opportunity?.eventAt),
      amount: isDefined(amountMicros) && amountMicros > 0,
    },
  );
};
