export type FieldsWidgetGroupStageStatus = 'completed' | 'current' | 'upcoming';

type FieldsWidgetGroupForStageStatus = {
  id: string;
  name: string;
};

// currentGroupName is null when the record's stage value has no mapped group
// (e.g. a terminal outcome like Lost/Cancelled) — no group can be resolved as
// completed/current in that case, matching the funnel stepper's own convention.
export const getFieldsWidgetGroupStageStatusByGroupId = (
  groups: FieldsWidgetGroupForStageStatus[],
  currentGroupName: string | null,
): Record<string, FieldsWidgetGroupStageStatus> => {
  const currentIndex = groups.findIndex(
    (group) => group.name === currentGroupName,
  );

  if (currentIndex === -1) {
    return {};
  }

  return Object.fromEntries(
    groups.map((group, index) => [
      group.id,
      index < currentIndex
        ? 'completed'
        : index === currentIndex
          ? 'current'
          : 'upcoming',
    ]),
  );
};
