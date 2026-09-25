import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

// Returning true lets native creation proceed; false means the handler has
// taken over (e.g. opened its own blocking modal) and native creation must
// not run.
export type OpportunityCreateGateHandler = (params: {
  recordInput: Partial<ObjectRecord>;
}) => boolean;
