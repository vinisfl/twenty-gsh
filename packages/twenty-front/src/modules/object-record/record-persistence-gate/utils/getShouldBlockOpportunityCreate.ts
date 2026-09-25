import { type OpportunityCreateGateHandler } from '@/object-record/record-persistence-gate/types/OpportunityCreateGateHandler';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const getShouldBlockOpportunityCreate = ({
  objectNameSingular,
  recordInput,
  opportunityCreateGateHandler,
}: {
  objectNameSingular: string;
  recordInput: Partial<ObjectRecord>;
  opportunityCreateGateHandler: OpportunityCreateGateHandler | undefined;
}): boolean => {
  if (
    objectNameSingular !== CoreObjectNameSingular.Opportunity ||
    !isDefined(opportunityCreateGateHandler)
  ) {
    return false;
  }

  return !opportunityCreateGateHandler({ recordInput });
};
