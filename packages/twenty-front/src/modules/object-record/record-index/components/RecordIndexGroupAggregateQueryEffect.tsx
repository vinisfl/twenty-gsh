import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { recordGroupDefinitionsComponentSelector } from '@/object-record/record-group/states/selectors/recordGroupDefinitionsComponentSelector';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useAggregateGqlFieldsFromRecordIndexGroupAggregates } from '@/object-record/record-index/hooks/useAggregateGqlFieldsFromRecordIndexGroupAggregates';
import { useRecordIndexGroupsAggregatesGroupBy } from '@/object-record/record-index/hooks/useRecordIndexGroupsAggregatesGroupBy';
import { useSetRecordIndexAggregateDisplayLabel } from '@/object-record/record-index/hooks/useSetRecordIndexAggregateDisplayLabel';
import { useSetRecordIndexAggregateDisplayValueForRecordGroupValue } from '@/object-record/record-index/hooks/useSetRecordIndexAggregateDisplayValueForRecordGroupValue';

import { recordIndexAggregateDisplayLabelComponentState } from '@/object-record/record-index/states/recordIndexAggregateDisplayLabelComponentState';
import { turnRecordIndexGroupByAggregateQueryResultIntoRecordAggregateValueByGroupValue } from '@/object-record/record-index/utils/turnRecordIndexGroupByAggregateQueryResultIntoRecordAggregateValueByGroupValue';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useEffect } from 'react';
import { type Nullable } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { AggregateOperations } from '~/generated-metadata/graphql';

export const RecordIndexGroupAggregateQueryEffect = ({
  recordIndexGroupFieldMetadataItem,
  recordIndexGroupAggregateOperation,
  recordIndexGroupAggregateFieldMetadataItem,
}: {
  recordIndexGroupFieldMetadataItem: FieldMetadataItem;
  recordIndexGroupAggregateFieldMetadataItem: Nullable<FieldMetadataItem>;
  recordIndexGroupAggregateOperation: ExtendedAggregateOperations;
}) => {
  const { objectMetadataItem } = useRecordIndexContextOrThrow();

  const { data, loading, error } = useRecordIndexGroupsAggregatesGroupBy({
    objectMetadataItem,
    groupByFieldMetadataItem: recordIndexGroupFieldMetadataItem,
    recordIndexGroupAggregateFieldMetadataItem,
    recordIndexGroupAggregateOperation,
  });

  const { recordAggregateGqlFields } =
    useAggregateGqlFieldsFromRecordIndexGroupAggregates({
      objectMetadataItem,
      recordIndexGroupAggregateFieldMetadataItem,
      recordIndexGroupAggregateOperation,
    });

  const recordIndexAggregateDisplayLabel = useAtomComponentStateCallbackState(
    recordIndexAggregateDisplayLabelComponentState,
  );

  const { setRecordIndexAggregateDisplayLabel } =
    useSetRecordIndexAggregateDisplayLabel();

  const { setRecordIndexAggregateDisplayValueForRecordGroupValue } =
    useSetRecordIndexAggregateDisplayValueForRecordGroupValue();

  const recordGroupDefinitions = useAtomComponentSelectorValue(
    recordGroupDefinitionsComponentSelector,
  );

  const isCountAndSumOperation =
    recordIndexGroupAggregateOperation === AggregateOperations.COUNT_AND_SUM;

  useEffect(() => {
    const getRawValueFromAggregateValues = (
      recordAggregateValuesByGqlField: Record<
        string,
        Nullable<string | number>
      >,
    ) => {
      if (isCountAndSumOperation) {
        const [countGqlField, sumGqlField] = recordAggregateGqlFields;
        return {
          count: recordAggregateValuesByGqlField[countGqlField] ?? 0,
          sum: recordAggregateValuesByGqlField[sumGqlField] ?? 0,
        };
      }

      const [singleOperationGqlField] = recordAggregateGqlFields;
      return recordAggregateValuesByGqlField[singleOperationGqlField] ?? 0;
    };

    if (
      !loading &&
      !isDefined(error) &&
      isDefined(data) &&
      recordAggregateGqlFields.length > 0
    ) {
      const { recordAggregateValueByGroupValueArray } =
        turnRecordIndexGroupByAggregateQueryResultIntoRecordAggregateValueByGroupValue(
          {
            objectMetadataItem,
            queryResult: data,
            recordAggregateGqlFields,
          },
        );

      if (isDefined(recordIndexGroupAggregateFieldMetadataItem)) {
        setRecordIndexAggregateDisplayLabel(
          recordIndexGroupAggregateOperation,
          recordIndexGroupAggregateFieldMetadataItem,
        );

        for (const recordGroupDefinition of recordGroupDefinitions) {
          const foundAggregateValueForGroup =
            recordAggregateValueByGroupValueArray.find(
              (recordAggregateValueByGroupValue) =>
                recordAggregateValueByGroupValue.recordGroupValue ===
                recordGroupDefinition.value,
            );

          if (isDefined(foundAggregateValueForGroup)) {
            setRecordIndexAggregateDisplayValueForRecordGroupValue(
              recordIndexGroupAggregateOperation,
              recordIndexGroupAggregateFieldMetadataItem,
              foundAggregateValueForGroup.recordGroupValue ?? '',
              getRawValueFromAggregateValues(
                foundAggregateValueForGroup.recordAggregateValuesByGqlField,
              ),
            );
          } else {
            setRecordIndexAggregateDisplayValueForRecordGroupValue(
              recordIndexGroupAggregateOperation,
              recordIndexGroupAggregateFieldMetadataItem,
              recordGroupDefinition.value ?? '',
              getRawValueFromAggregateValues({}),
            );
          }
        }
      }
    }
  }, [
    data,
    loading,
    error,
    setRecordIndexAggregateDisplayValueForRecordGroupValue,
    setRecordIndexAggregateDisplayLabel,
    recordIndexGroupAggregateFieldMetadataItem,
    recordIndexGroupAggregateOperation,
    recordAggregateGqlFields,
    recordIndexAggregateDisplayLabel,
    objectMetadataItem,
    recordGroupDefinitions,
    isCountAndSumOperation,
  ]);

  return null;
};
