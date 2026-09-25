import { type Nullable } from 'twenty-shared/types';

export type RecordAggregateValueByRecordGroupValue = {
  recordGroupValue: Nullable<string>;
  recordAggregateValuesByGqlField: Record<string, Nullable<string | number>>;
};
