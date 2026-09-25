import { useEffect } from 'react';
import { useSetAtom } from 'jotai';

import { recordFieldPersistGateHandlerState } from '@/object-record/record-persistence-gate/states/recordFieldPersistGateHandlerState';
import { type RecordFieldPersistGateHandler } from '@/object-record/record-persistence-gate/types/RecordFieldPersistGateHandler';

// Several chain-gate handlers share this single-handler extension point (one
// per gated object/field pair). Compose with whatever handler is already
// registered instead of replacing it, and restore that exact previous
// handler on cleanup, so handlers mounted together don't clobber each other.
export const useRegisterRecordFieldPersistGateHandler = (
  handler: RecordFieldPersistGateHandler,
) => {
  const setRecordFieldPersistGateHandler = useSetAtom(
    recordFieldPersistGateHandlerState,
  );

  useEffect(() => {
    let previousHandler: RecordFieldPersistGateHandler | undefined;

    setRecordFieldPersistGateHandler(
      (currentHandler: RecordFieldPersistGateHandler | undefined) => {
        previousHandler = currentHandler;

        const composedHandler: RecordFieldPersistGateHandler = async (params) =>
          (await handler(params)) === false
            ? false
            : ((await previousHandler?.(params)) ?? true);

        return composedHandler;
      },
    );

    return () => setRecordFieldPersistGateHandler(() => previousHandler);
  }, [handler, setRecordFieldPersistGateHandler]);
};
