import { type RecordIndexGroupByQueryResult } from '@/object-record/record-index/types/RecordIndexGroupByQueryResult';
import { turnRecordIndexGroupByAggregateQueryResultIntoRecordAggregateValueByGroupValue } from '@/object-record/record-index/utils/turnRecordIndexGroupByAggregateQueryResultIntoRecordAggregateValueByGroupValue';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

describe('turnRecordIndexGroupByAggregateQueryResultIntoRecordAggregateValueByGroupValue', () => {
  const mockCompanyObjectMetadataItem =
    getMockObjectMetadataItemOrThrow('company');

  const queryResultGqlFieldName = `${mockCompanyObjectMetadataItem.namePlural}GroupBy`;

  it('should extract a single aggregate field per group', () => {
    const { recordAggregateValueByGroupValueArray } =
      turnRecordIndexGroupByAggregateQueryResultIntoRecordAggregateValueByGroupValue(
        {
          objectMetadataItem: mockCompanyObjectMetadataItem,
          recordAggregateGqlFields: ['totalCount'],
          queryResult: {
            [queryResultGqlFieldName]: [
              { groupByDimensionValues: ['STAGE_A'], totalCount: 3 },
              { groupByDimensionValues: ['STAGE_B'], totalCount: 5 },
            ],
          } as unknown as RecordIndexGroupByQueryResult,
        },
      );

    expect(recordAggregateValueByGroupValueArray).toEqual([
      {
        recordGroupValue: 'STAGE_A',
        recordAggregateValuesByGqlField: { totalCount: 3 },
      },
      {
        recordGroupValue: 'STAGE_B',
        recordAggregateValuesByGqlField: { totalCount: 5 },
      },
    ]);
  });

  it('should extract multiple aggregate fields per group for the combined count and sum mode', () => {
    const { recordAggregateValueByGroupValueArray } =
      turnRecordIndexGroupByAggregateQueryResultIntoRecordAggregateValueByGroupValue(
        {
          objectMetadataItem: mockCompanyObjectMetadataItem,
          recordAggregateGqlFields: ['totalCount', 'sumAmountAmountMicros'],
          queryResult: {
            [queryResultGqlFieldName]: [
              {
                groupByDimensionValues: ['STAGE_A'],
                totalCount: 3,
                sumAmountAmountMicros: 18000000000,
              },
            ],
          } as unknown as RecordIndexGroupByQueryResult,
        },
      );

    expect(recordAggregateValueByGroupValueArray).toEqual([
      {
        recordGroupValue: 'STAGE_A',
        recordAggregateValuesByGqlField: {
          totalCount: 3,
          sumAmountAmountMicros: 18000000000,
        },
      },
    ]);
  });

  it('should ignore group rows with more than one group by dimension value', () => {
    const { recordAggregateValueByGroupValueArray } =
      turnRecordIndexGroupByAggregateQueryResultIntoRecordAggregateValueByGroupValue(
        {
          objectMetadataItem: mockCompanyObjectMetadataItem,
          recordAggregateGqlFields: ['totalCount'],
          queryResult: {
            [queryResultGqlFieldName]: [
              {
                groupByDimensionValues: ['STAGE_A', 'EXTRA'],
                totalCount: 3,
              },
            ],
          } as unknown as RecordIndexGroupByQueryResult,
        },
      );

    expect(recordAggregateValueByGroupValueArray).toEqual([]);
  });
});
