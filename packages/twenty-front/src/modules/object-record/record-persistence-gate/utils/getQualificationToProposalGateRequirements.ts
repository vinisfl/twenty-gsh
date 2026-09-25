import { type GateRequirementCheckResult } from '@/object-record/record-persistence-gate/types/GateRequirementCheckResult';
import { GSH_EVENT_MODALITY_INTERNAL_VALUE } from '@/object-record/record-persistence-gate/constants/GshEventModalityInternalValue';
import { buildGateRequirementCheckResult } from '@/object-record/record-persistence-gate/utils/buildGateRequirementCheckResult';
import { isFilled } from '@/object-record/record-persistence-gate/utils/isFilled';

export type QualificationToProposalGateRequirementKey =
  | 'eventType'
  | 'audience'
  | 'location'
  | 'city'
  | 'eventAt';

type QualificationToProposalGateOpportunity = {
  eventAudience: number | null | undefined;
  eventModality?: string | null | undefined;
  eventLocation: string | null | undefined;
  eventAt: string | null | undefined;
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
  return buildGateRequirementCheckResult<QualificationToProposalGateRequirementKey>(
    {
      eventType: isFilled(corporateEvent?.eventType),
      audience:
        typeof audience === 'number' &&
        Number.isInteger(audience) &&
        audience > 0,
      location: isFilled(opportunity?.eventLocation),
      city:
        opportunity?.eventModality === GSH_EVENT_MODALITY_INTERNAL_VALUE ||
        isFilled(corporateEvent?.city),
      eventAt: isFilled(opportunity?.eventAt),
    },
  );
};
