import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { getAvailableAggregationsFromObjectFields } from '@/object-record/utils/getAvailableAggregationsFromObjectFields';
import { useMemo } from 'react';
import { type Nullable } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { AggregateOperations } from '~/generated-metadata/graphql';

export const useAggregateGqlFieldsFromRecordIndexGroupAggregates = ({
  objectMetadataItem,
  recordIndexGroupAggregateFieldMetadataItem,
  recordIndexGroupAggregateOperation,
}: {
  objectMetadataItem: EnrichedObjectMetadataItem;
  recordIndexGroupAggregateFieldMetadataItem: Nullable<FieldMetadataItem>;
  recordIndexGroupAggregateOperation: ExtendedAggregateOperations;
}) => {
  const availableAggregations = useMemo(
    () =>
      getAvailableAggregationsFromObjectFields(
        objectMetadataItem.readableFields,
      ),
    [objectMetadataItem.readableFields],
  );

  if (recordIndexGroupAggregateOperation === AggregateOperations.COUNT) {
    return {
      recordAggregateGqlFields: ['totalCount'],
    };
  }

  if (!isDefined(recordIndexGroupAggregateFieldMetadataItem)) {
    throw new Error(
      `Cannot query an aggregate without a field metadata item for ${objectMetadataItem.nameSingular}, aggregate operation : ${recordIndexGroupAggregateOperation}`,
    );
  }

  const recordAggregateGqlField =
    availableAggregations[recordIndexGroupAggregateFieldMetadataItem.name]?.[
      recordIndexGroupAggregateOperation
    ];

  if (!isDefined(recordAggregateGqlField)) {
    return { recordAggregateGqlFields: [] };
  }

  if (
    recordIndexGroupAggregateOperation === AggregateOperations.COUNT_AND_SUM
  ) {
    // Order matters: RecordIndexGroupAggregateQueryEffect destructures this as [countGqlField, sumGqlField].
    return {
      recordAggregateGqlFields: ['totalCount', recordAggregateGqlField],
    };
  }

  return { recordAggregateGqlFields: [recordAggregateGqlField] };
};
