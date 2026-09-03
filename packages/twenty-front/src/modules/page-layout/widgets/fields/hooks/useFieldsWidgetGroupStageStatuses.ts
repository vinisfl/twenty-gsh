import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { OPPORTUNITY_FUNNEL_GROUP_SYNC_FIELD_NAME } from '@/page-layout/widgets/fields/constants/OpportunityFunnelGroupSyncFieldName';
import { OPPORTUNITY_FUNNEL_GROUP_SYNC_OBJECT_NAME_SINGULAR } from '@/page-layout/widgets/fields/constants/OpportunityFunnelGroupSyncObjectNameSingular';
import { OPPORTUNITY_FUNNEL_STAGE_VALUE_TO_GROUP_NAME } from '@/page-layout/widgets/fields/constants/OpportunityFunnelStageValueToGroupName';
import { type FieldsWidgetGroup } from '@/page-layout/widgets/fields/types/FieldsWidgetGroup';
import { getFieldsWidgetGroupStageStatusByGroupId } from '@/page-layout/widgets/fields/utils/getFieldsWidgetGroupStageStatusByGroupId';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

type UseFieldsWidgetGroupStageStatusesParams = {
  recordId: string;
  objectNameSingular: string;
  groups: FieldsWidgetGroup[];
};

export const useFieldsWidgetGroupStageStatuses = ({
  recordId,
  objectNameSingular,
  groups,
}: UseFieldsWidgetGroupStageStatusesParams) => {
  const recordStore = useAtomFamilyStateValue(recordStoreFamilyState, recordId);

  if (
    objectNameSingular !== OPPORTUNITY_FUNNEL_GROUP_SYNC_OBJECT_NAME_SINGULAR
  ) {
    return {};
  }

  const stageValue = recordStore?.[OPPORTUNITY_FUNNEL_GROUP_SYNC_FIELD_NAME] as
    | string
    | null
    | undefined;

  const currentGroupName = stageValue
    ? (OPPORTUNITY_FUNNEL_STAGE_VALUE_TO_GROUP_NAME[stageValue] ?? null)
    : null;

  return getFieldsWidgetGroupStageStatusByGroupId(groups, currentGroupName);
};
