import { getAggregateLabelWithFieldName } from '@/object-record/record-aggregate/utils/getAggregateLabelWithFieldName';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { findByProperty } from 'twenty-shared/utils';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

describe('getAggregateLabelWithFieldName', () => {
  const mockFieldMetadataItem = getMockObjectMetadataItemOrThrow(
    'company',
  ).fields.find(findByProperty('name', 'name'))!;

  it('should return correct label for provided field metadata item and operation', () => {
    expect(
      getAggregateLabelWithFieldName({
        aggregateFieldMetadataItem: mockFieldMetadataItem,
        aggregateOperation: AggregateOperations.COUNT,
      }),
    ).toBe('All of Name');
  });

  it('should return correct label for the combined count and sum operation', () => {
    expect(
      getAggregateLabelWithFieldName({
        aggregateFieldMetadataItem: mockFieldMetadataItem,
        aggregateOperation: AggregateOperations.COUNT_AND_SUM,
      }),
    ).toBe('Count and sum of Name');
  });
});
