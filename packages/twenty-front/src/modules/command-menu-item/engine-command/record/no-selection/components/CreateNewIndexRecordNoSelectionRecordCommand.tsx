import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { opportunityCreateGateHandlerState } from '@/object-record/record-persistence-gate/states/opportunityCreateGateHandlerState';
import { getShouldBlockOpportunityCreate } from '@/object-record/record-persistence-gate/utils/getShouldBlockOpportunityCreate';
import { useCreateNewIndexRecord } from '@/object-record/record-table/hooks/useCreateNewIndexRecord';
import { useAtomValue } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

export const CreateNewIndexRecordNoSelectionRecordCommand = () => {
  const { objectMetadataItem, recordIndexId } = useHeadlessCommandContextApi();

  if (!isDefined(objectMetadataItem) || !isDefined(recordIndexId)) {
    throw new Error(
      'Object metadata item and record index ID are required to create new index record',
    );
  }

  const { createNewIndexRecord } = useCreateNewIndexRecord({
    objectMetadataItem,
    instanceId: recordIndexId,
  });

  const opportunityCreateGateHandler = useAtomValue(
    opportunityCreateGateHandlerState,
  );

  return (
    <HeadlessEngineCommandWrapperEffect
      execute={() => {
        if (
          getShouldBlockOpportunityCreate({
            objectNameSingular: objectMetadataItem.nameSingular,
            recordInput: {},
            opportunityCreateGateHandler,
          })
        ) {
          return;
        }

        return createNewIndexRecord({ position: 'first' });
      }}
    />
  );
};
