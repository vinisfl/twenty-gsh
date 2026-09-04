import { useEffect } from 'react';
import { useSetAtom } from 'jotai';

import { opportunityStageAdvanceGateHandlerState } from '@/object-record/record-persistence-gate/states/opportunityStageAdvanceGateHandlerState';
import { type OpportunityStageAdvanceGateHandler } from '@/object-record/record-persistence-gate/types/OpportunityStageAdvanceGateHandler';

// Several gate modals share this single-handler extension point (one per
// stage transition). Compose with whatever handler is already registered
// instead of replacing it, and restore that exact previous handler on
// cleanup, so gates mounted together don't clobber each other.
export const useRegisterOpportunityStageAdvanceGateHandler = (
  handler: OpportunityStageAdvanceGateHandler,
) => {
  const setOpportunityStageAdvanceGateHandler = useSetAtom(
    opportunityStageAdvanceGateHandlerState,
  );

  useEffect(() => {
    let previousHandler: OpportunityStageAdvanceGateHandler | undefined;

    setOpportunityStageAdvanceGateHandler(
      (currentHandler: OpportunityStageAdvanceGateHandler | undefined) => {
        previousHandler = currentHandler;

        const composedHandler: OpportunityStageAdvanceGateHandler = (params) =>
          handler(params) === false
            ? false
            : (previousHandler?.(params) ?? true);

        return composedHandler;
      },
    );

    return () => setOpportunityStageAdvanceGateHandler(() => previousHandler);
  }, [handler, setOpportunityStageAdvanceGateHandler]);
};
