import { getIsStageAdvanceDrop } from '@/object-record/record-board/utils/getIsStageAdvanceDrop';
import { type RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { type OpportunityStageAdvanceGateHandler } from '@/object-record/record-persistence-gate/types/OpportunityStageAdvanceGateHandler';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const getShouldBlockOpportunityStageAdvanceDrop = ({
  objectNameSingular,
  recordId,
  sourceGroup,
  destinationGroup,
  opportunityStageAdvanceGateHandler,
}: {
  objectNameSingular: string;
  recordId: string;
  sourceGroup: RecordGroupDefinition | undefined;
  destinationGroup: RecordGroupDefinition | undefined;
  opportunityStageAdvanceGateHandler:
    | OpportunityStageAdvanceGateHandler
    | undefined;
}): boolean => {
  if (
    objectNameSingular !== CoreObjectNameSingular.Opportunity ||
    !isDefined(opportunityStageAdvanceGateHandler) ||
    !isDefined(sourceGroup) ||
    !isDefined(destinationGroup)
  ) {
    return false;
  }

  const isStageAdvanceDrop = getIsStageAdvanceDrop({
    sourceGroupPosition: sourceGroup.position,
    destinationGroupPosition: destinationGroup.position,
  });

  if (!isStageAdvanceDrop) {
    return false;
  }

  return !opportunityStageAdvanceGateHandler({
    recordId,
    sourceStageValue: sourceGroup.value,
    destinationStageValue: destinationGroup.value,
  });
};
