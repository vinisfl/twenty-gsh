import { type RecordFieldPersistGateHandler } from '@/object-record/record-persistence-gate/types/RecordFieldPersistGateHandler';
import { isDefined } from 'twenty-shared/utils';

export const getShouldBlockRecordFieldPersist = async ({
  objectNameSingular,
  recordId,
  fieldName,
  valueToPersist,
  recordFieldPersistGateHandler,
}: {
  objectNameSingular: string;
  recordId: string;
  fieldName: string;
  valueToPersist: unknown;
  recordFieldPersistGateHandler: RecordFieldPersistGateHandler | undefined;
}): Promise<boolean> => {
  if (!isDefined(recordFieldPersistGateHandler)) {
    return false;
  }

  const isAllowed = await recordFieldPersistGateHandler({
    objectNameSingular,
    recordId,
    fieldName,
    valueToPersist,
  });

  return !isAllowed;
};
