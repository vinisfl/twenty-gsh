import { renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { useRegisterRecordFieldPersistGateHandler } from '@/object-record/record-persistence-gate/hooks/useRegisterRecordFieldPersistGateHandler';
import { recordFieldPersistGateHandlerState } from '@/object-record/record-persistence-gate/states/recordFieldPersistGateHandlerState';
import { type RecordFieldPersistGateHandler } from '@/object-record/record-persistence-gate/types/RecordFieldPersistGateHandler';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
);

describe('useRegisterRecordFieldPersistGateHandler', () => {
  beforeEach(() => {
    resetJotaiStore();
  });

  it('registers a handler that blocks matching calls and passes through others', async () => {
    const handlerA: RecordFieldPersistGateHandler = jest.fn(
      ({ fieldName }) => fieldName !== 'purchaseFormStatus',
    );

    renderHook(() => useRegisterRecordFieldPersistGateHandler(handlerA), {
      wrapper: Wrapper,
    });

    const registeredHandler = jotaiStore.get(
      recordFieldPersistGateHandlerState,
    );

    await expect(
      registeredHandler?.({
        objectNameSingular: 'opportunity',
        recordId: 'record-1',
        fieldName: 'purchaseFormStatus',
        valueToPersist: 'SENT',
      }),
    ).resolves.toBe(false);
    await expect(
      registeredHandler?.({
        objectNameSingular: 'opportunity',
        recordId: 'record-1',
        fieldName: 'invoiceStatus',
        valueToPersist: 'ISSUED',
      }),
    ).resolves.toBe(true);
  });

  it('composes two simultaneously-registered handlers without either clobbering the other', async () => {
    const handlerA: RecordFieldPersistGateHandler = ({ fieldName }) =>
      fieldName !== 'purchaseFormStatus';
    const handlerB: RecordFieldPersistGateHandler = ({ fieldName }) =>
      fieldName !== 'invoiceStatus';

    renderHook(() => useRegisterRecordFieldPersistGateHandler(handlerA), {
      wrapper: Wrapper,
    });
    const { unmount: unmountB } = renderHook(
      () => useRegisterRecordFieldPersistGateHandler(handlerB),
      { wrapper: Wrapper },
    );

    const composedHandler = jotaiStore.get(recordFieldPersistGateHandlerState);

    await expect(
      composedHandler?.({
        objectNameSingular: 'opportunity',
        recordId: 'record-1',
        fieldName: 'purchaseFormStatus',
        valueToPersist: 'SENT',
      }),
    ).resolves.toBe(false);
    await expect(
      composedHandler?.({
        objectNameSingular: 'opportunity',
        recordId: 'record-1',
        fieldName: 'invoiceStatus',
        valueToPersist: 'ISSUED',
      }),
    ).resolves.toBe(false);
    await expect(
      composedHandler?.({
        objectNameSingular: 'opportunity',
        recordId: 'record-1',
        fieldName: 'contractStatus',
        valueToPersist: 'SENT',
      }),
    ).resolves.toBe(true);

    unmountB();

    const handlerAfterBUnmounts = jotaiStore.get(
      recordFieldPersistGateHandlerState,
    );

    await expect(
      handlerAfterBUnmounts?.({
        objectNameSingular: 'opportunity',
        recordId: 'record-1',
        fieldName: 'purchaseFormStatus',
        valueToPersist: 'SENT',
      }),
    ).resolves.toBe(false);
    await expect(
      handlerAfterBUnmounts?.({
        objectNameSingular: 'opportunity',
        recordId: 'record-1',
        fieldName: 'invoiceStatus',
        valueToPersist: 'ISSUED',
      }),
    ).resolves.toBe(true);
  });

  it('restores the atom to undefined once every handler unmounts', () => {
    const handlerA: RecordFieldPersistGateHandler = () => true;

    const { unmount } = renderHook(
      () => useRegisterRecordFieldPersistGateHandler(handlerA),
      { wrapper: Wrapper },
    );

    unmount();

    expect(jotaiStore.get(recordFieldPersistGateHandlerState)).toBeUndefined();
  });
});
