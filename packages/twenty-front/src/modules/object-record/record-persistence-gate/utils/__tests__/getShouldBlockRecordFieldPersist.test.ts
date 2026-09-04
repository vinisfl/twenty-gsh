import { getShouldBlockRecordFieldPersist } from '@/object-record/record-persistence-gate/utils/getShouldBlockRecordFieldPersist';

describe('getShouldBlockRecordFieldPersist', () => {
  it('should block when the registered handler blocks', async () => {
    await expect(
      getShouldBlockRecordFieldPersist({
        objectNameSingular: 'opportunity',
        recordId: 'record-1',
        fieldName: 'purchaseFormStatus',
        valueToPersist: 'SENT',
        recordFieldPersistGateHandler: () => false,
      }),
    ).resolves.toBe(true);
  });

  it('should not block when the registered handler allows, reproducing native behavior', async () => {
    await expect(
      getShouldBlockRecordFieldPersist({
        objectNameSingular: 'opportunity',
        recordId: 'record-1',
        fieldName: 'purchaseFormStatus',
        valueToPersist: 'SENT',
        recordFieldPersistGateHandler: () => true,
      }),
    ).resolves.toBe(false);
  });

  it('should not block when no handler is registered', async () => {
    await expect(
      getShouldBlockRecordFieldPersist({
        objectNameSingular: 'opportunity',
        recordId: 'record-1',
        fieldName: 'purchaseFormStatus',
        valueToPersist: 'SENT',
        recordFieldPersistGateHandler: undefined,
      }),
    ).resolves.toBe(false);
  });

  it('should await an async handler before deciding', async () => {
    await expect(
      getShouldBlockRecordFieldPersist({
        objectNameSingular: 'opportunity',
        recordId: 'record-1',
        fieldName: 'purchaseFormStatus',
        valueToPersist: 'SENT',
        recordFieldPersistGateHandler: async () => false,
      }),
    ).resolves.toBe(true);
  });
});
