import { renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { useRegisterOpportunityStageAdvanceGateHandler } from '@/object-record/record-persistence-gate/hooks/useRegisterOpportunityStageAdvanceGateHandler';
import { opportunityStageAdvanceGateHandlerState } from '@/object-record/record-persistence-gate/states/opportunityStageAdvanceGateHandlerState';
import { type OpportunityStageAdvanceGateHandler } from '@/object-record/record-persistence-gate/types/OpportunityStageAdvanceGateHandler';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
);

describe('useRegisterOpportunityStageAdvanceGateHandler', () => {
  beforeEach(() => {
    resetJotaiStore();
  });

  it('registers a handler that blocks matching calls and passes through others', () => {
    const handlerA: OpportunityStageAdvanceGateHandler = jest.fn(
      ({ sourceStageValue }) => sourceStageValue !== 'A',
    );

    renderHook(() => useRegisterOpportunityStageAdvanceGateHandler(handlerA), {
      wrapper: Wrapper,
    });

    const registeredHandler = jotaiStore.get(
      opportunityStageAdvanceGateHandlerState,
    );

    expect(
      registeredHandler?.({
        recordId: 'record-1',
        sourceStageValue: 'A',
        destinationStageValue: null,
      }),
    ).toBe(false);
    expect(
      registeredHandler?.({
        recordId: 'record-1',
        sourceStageValue: 'B',
        destinationStageValue: null,
      }),
    ).toBe(true);
  });

  it('composes two simultaneously-registered handlers without either clobbering the other', () => {
    const handlerA: OpportunityStageAdvanceGateHandler = ({
      sourceStageValue,
    }) => sourceStageValue !== 'A';
    const handlerB: OpportunityStageAdvanceGateHandler = ({
      sourceStageValue,
    }) => sourceStageValue !== 'B';

    renderHook(() => useRegisterOpportunityStageAdvanceGateHandler(handlerA), {
      wrapper: Wrapper,
    });
    const { unmount: unmountB } = renderHook(
      () => useRegisterOpportunityStageAdvanceGateHandler(handlerB),
      { wrapper: Wrapper },
    );

    const composedHandler = jotaiStore.get(
      opportunityStageAdvanceGateHandlerState,
    );

    expect(
      composedHandler?.({
        recordId: 'record-1',
        sourceStageValue: 'A',
        destinationStageValue: null,
      }),
    ).toBe(false);
    expect(
      composedHandler?.({
        recordId: 'record-1',
        sourceStageValue: 'B',
        destinationStageValue: null,
      }),
    ).toBe(false);
    expect(
      composedHandler?.({
        recordId: 'record-1',
        sourceStageValue: 'C',
        destinationStageValue: null,
      }),
    ).toBe(true);

    unmountB();

    const handlerAfterBUnmounts = jotaiStore.get(
      opportunityStageAdvanceGateHandlerState,
    );

    expect(
      handlerAfterBUnmounts?.({
        recordId: 'record-1',
        sourceStageValue: 'A',
        destinationStageValue: null,
      }),
    ).toBe(false);
    expect(
      handlerAfterBUnmounts?.({
        recordId: 'record-1',
        sourceStageValue: 'B',
        destinationStageValue: null,
      }),
    ).toBe(true);
  });

  it('restores the atom to undefined once every handler unmounts', () => {
    const handlerA: OpportunityStageAdvanceGateHandler = () => true;

    const { unmount } = renderHook(
      () => useRegisterOpportunityStageAdvanceGateHandler(handlerA),
      { wrapper: Wrapper },
    );

    unmount();

    expect(
      jotaiStore.get(opportunityStageAdvanceGateHandlerState),
    ).toBeUndefined();
  });
});
