import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { OPPORTUNITY_FUNNEL_GROUP_SYNC_FIELD_NAME } from '@/page-layout/widgets/fields/constants/OpportunityFunnelGroupSyncFieldName';
import { OPPORTUNITY_FUNNEL_GROUP_SYNC_OBJECT_NAME_SINGULAR } from '@/page-layout/widgets/fields/constants/OpportunityFunnelGroupSyncObjectNameSingular';
import { OPPORTUNITY_FUNNEL_STAGE_VALUE_TO_GROUP_NAME } from '@/page-layout/widgets/fields/constants/OpportunityFunnelStageValueToGroupName';
import { type FieldsWidgetGroup } from '@/page-layout/widgets/fields/types/FieldsWidgetGroup';
import {
  type FieldsWidgetGroupStageStatus,
  getFieldsWidgetGroupStageStatusByGroupId,
} from '@/page-layout/widgets/fields/utils/getFieldsWidgetGroupStageStatusByGroupId';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

type UseFieldsWidgetGroupStageStatusesParams = {
  recordId: string;
  objectNameSingular: string;
  groups: FieldsWidgetGroup[];
};

type UseFieldsWidgetGroupStageStatusesResult = {
  // false when the widget isn't for an Opportunity record — callers should
  // fall back to their pre-existing default (e.g. always expanded) rather
  // than reading statusByGroupId, since an empty map here is ambiguous
  // between "not applicable" and "applicable, but no group is current"
  // (e.g. a terminal stage like Lost/Cancelled).
  isActive: boolean;
  statusByGroupId: Record<string, FieldsWidgetGroupStageStatus>;
};

export const useFieldsWidgetGroupStageStatuses = ({
  recordId,
  objectNameSingular,
  groups,
}: UseFieldsWidgetGroupStageStatusesParams): UseFieldsWidgetGroupStageStatusesResult => {
  const recordStore = useAtomFamilyStateValue(recordStoreFamilyState, recordId);

  const isActive =
    objectNameSingular === OPPORTUNITY_FUNNEL_GROUP_SYNC_OBJECT_NAME_SINGULAR;

  if (!isActive) {
    return { isActive, statusByGroupId: {} };
  }

  const stageValue = recordStore?.[OPPORTUNITY_FUNNEL_GROUP_SYNC_FIELD_NAME] as
    | string
    | null
    | undefined;

  const currentGroupName = stageValue
    ? (OPPORTUNITY_FUNNEL_STAGE_VALUE_TO_GROUP_NAME[stageValue] ?? null)
    : null;

  return {
    isActive,
    statusByGroupId: getFieldsWidgetGroupStageStatusByGroupId(
      groups,
      currentGroupName,
    ),
  };
};
