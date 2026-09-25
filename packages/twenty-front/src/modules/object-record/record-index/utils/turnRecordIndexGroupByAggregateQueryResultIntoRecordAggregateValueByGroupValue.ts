import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type RecordAggregateValueByRecordGroupValue } from '@/object-record/record-index/types/RecordAggregateValueByRecordGroupValue';
import { type RecordIndexGroupByQueryResult } from '@/object-record/record-index/types/RecordIndexGroupByQueryResult';
import { getGroupByQueryResultGqlFieldName } from '@/page-layout/utils/getGroupByQueryResultGqlFieldName';

type TurnRecordIndexGroupByAggregateQueryResultIntoRecordAggregateValueByGroupValueParams =
  {
    queryResult: RecordIndexGroupByQueryResult;
    recordAggregateGqlFields: string[];
    objectMetadataItem: EnrichedObjectMetadataItem;
  };

export const turnRecordIndexGroupByAggregateQueryResultIntoRecordAggregateValueByGroupValue =
  ({
    objectMetadataItem,
    queryResult,
    recordAggregateGqlFields,
  }: TurnRecordIndexGroupByAggregateQueryResultIntoRecordAggregateValueByGroupValueParams) => {
    const recordAggregateValueByGroupValueArray: RecordAggregateValueByRecordGroupValue[] =
      [];

    const queryResultGqlFieldName =
      getGroupByQueryResultGqlFieldName(objectMetadataItem);

    const groupByQueryResultItems = queryResult[queryResultGqlFieldName];

    for (const groupByQueryResultItem of groupByQueryResultItems) {
      if (groupByQueryResultItem.groupByDimensionValues.length === 1) {
        const groupByValue = groupByQueryResultItem.groupByDimensionValues[0];

        const recordAggregateValuesByGqlField = recordAggregateGqlFields.reduce<
          Record<string, string | number>
        >((acc, gqlAggregateFieldName) => {
          acc[gqlAggregateFieldName] =
            groupByQueryResultItem[gqlAggregateFieldName];
          return acc;
        }, {});

        recordAggregateValueByGroupValueArray.push({
          recordGroupValue: groupByValue,
          recordAggregateValuesByGqlField,
        });
      }
    }

    return {
      recordAggregateValueByGroupValueArray,
    };
  };
