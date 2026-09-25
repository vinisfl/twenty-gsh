import { act, render, screen } from '@testing-library/react';
import { type ReactNode } from 'react';
import userEvent from '@testing-library/user-event';
import { CoreObjectNameSingular } from 'twenty-shared/types';

import { OpportunityLostCancelledGateModal } from '@/object-record/record-persistence-gate/components/OpportunityLostCancelledGateModal';
import { opportunityStageAdvanceGateHandlerState } from '@/object-record/record-persistence-gate/states/opportunityStageAdvanceGateHandlerState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const mockUpdateOneRecord = jest.fn();
const mockOpenModal = jest.fn();
const mockCloseModal = jest.fn();

let opportunityRecords: unknown[] = [];

jest.mock('@lingui/react/macro', () => ({
  useLingui: () => ({
    i18n: {
      _: ({ id, message }: { id: string; message?: string }) => message ?? id,
    },
  }),
}));

jest.mock('@lingui/react', () => ({
  useLingui: () => ({
    i18n: {
      _: ({ id, message }: { id: string; message?: string }) => message ?? id,
    },
  }),
}));

jest.mock('@/object-record/hooks/useFindManyRecords', () => ({
  useFindManyRecords: () => ({ records: opportunityRecords, loading: false }),
}));

jest.mock('@/object-record/hooks/useUpdateOneRecord', () => ({
  useUpdateOneRecord: () => ({ updateOneRecord: mockUpdateOneRecord }),
}));

jest.mock('@/ui/layout/modal/hooks/useModal', () => ({
  useModal: () => ({
    openModal: mockOpenModal,
    closeModal: mockCloseModal,
  }),
}));

jest.mock('@/ui/feedback/snack-bar-manager/hooks/useSnackBar', () => ({
  useSnackBar: () => ({ enqueueErrorSnackBar: jest.fn() }),
}));

jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue',
  () => ({
    useAtomFamilySelectorValue: () => ({ id: 'object-metadata-id' }),
  }),
);

jest.mock('@/ui/layout/modal/components/ModalStatefulWrapper', () => ({
  ModalStatefulWrapper: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
}));

jest.mock('twenty-ui/input', () => ({
  Button: ({
    title,
    onClick,
    disabled,
  }: {
    title: string;
    onClick: () => void;
    disabled?: boolean;
  }) => (
    <button onClick={onClick} disabled={disabled}>
      {title}
    </button>
  ),
}));

// Mirrors Select.tsx's own selectedOption fallback (matching option, else
// emptyOption, else options[0]) so tests can catch a regression of the bug
// fixed in #70: a required Select rendering its first option as if chosen
// while the field's own value is still empty.
jest.mock('@/ui/input/components/Select', () => ({
  Select: ({
    dropdownId,
    label,
    value,
    options,
    emptyOption,
    onChange,
  }: {
    dropdownId: string;
    label: string;
    value: string;
    options: { value: string; label: string }[];
    emptyOption?: { value: string; label: string };
    onChange: (value: string) => void;
  }) => {
    const selectedOption =
      options.find((option) => option.value === value) ??
      emptyOption ??
      options[0];

    return (
      <>
        <span data-testid={`${dropdownId}-selected-label`}>
          {selectedOption?.label}
        </span>
        <label>
          {label}
          <select
            data-testid={dropdownId}
            value={value}
            onChange={(event) => onChange(event.target.value)}
          >
            <option value="" />
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </>
    );
  },
}));

const Wrapper = getJestMetadataAndApolloMocksWrapper({ apolloMocks: [] });

const openGate = ({
  sourceStageValue,
  destinationStageValue,
}: {
  sourceStageValue: string;
  destinationStageValue: string;
}) => {
  const handler = jotaiStore.get(opportunityStageAdvanceGateHandlerState);

  act(() => {
    expect(
      handler?.({
        recordId: 'opportunity-1',
        sourceStageValue,
        destinationStageValue,
      }),
    ).toBe(false);
  });
};

describe('OpportunityLostCancelledGateModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    opportunityRecords = [
      {
        id: 'opportunity-1',
        name: 'Confraternização de fim de ano',
        eventLossReason: null,
      },
    ];
    mockUpdateOneRecord.mockResolvedValue({ id: 'opportunity-1' });
  });

  it('blocks advancing straight to Lost without opening a native update', () => {
    render(<OpportunityLostCancelledGateModal />, { wrapper: Wrapper });

    openGate({
      sourceStageValue: 'ENTRY',
      destinationStageValue: 'LOST',
    });

    expect(mockOpenModal).toHaveBeenCalledWith(
      'opportunity-lost-cancelled-gate-modal',
    );
    expect(mockUpdateOneRecord).not.toHaveBeenCalled();
  });

  it('blocks advancing straight to Cancelled from a different origin stage', () => {
    render(<OpportunityLostCancelledGateModal />, { wrapper: Wrapper });

    openGate({
      sourceStageValue: 'PRODUCTION_FORMALIZATION_EVENT',
      destinationStageValue: 'CANCELLED',
    });

    expect(mockOpenModal).toHaveBeenCalledWith(
      'opportunity-lost-cancelled-gate-modal',
    );
    expect(mockUpdateOneRecord).not.toHaveBeenCalled();
  });

  it('lets unrelated stage transitions persist natively', () => {
    render(<OpportunityLostCancelledGateModal />, { wrapper: Wrapper });

    const handler = jotaiStore.get(opportunityStageAdvanceGateHandlerState);

    expect(
      handler?.({
        recordId: 'opportunity-1',
        sourceStageValue: 'QUALIFICATION',
        destinationStageValue: 'PROPOSAL_NEGOTIATION',
      }),
    ).toBe(true);
    expect(mockOpenModal).not.toHaveBeenCalled();
  });

  it('does not persist the advancement when the modal is closed without a reason', () => {
    render(<OpportunityLostCancelledGateModal />, { wrapper: Wrapper });
    openGate({ sourceStageValue: 'ENTRY', destinationStageValue: 'LOST' });

    act(() => {
      screen.getByText('Cancelar').click();
    });

    expect(mockUpdateOneRecord).not.toHaveBeenCalled();
  });

  it('keeps the confirm button disabled until a reason is selected', () => {
    render(<OpportunityLostCancelledGateModal />, { wrapper: Wrapper });
    openGate({ sourceStageValue: 'ENTRY', destinationStageValue: 'LOST' });

    expect(screen.getByText('Confirmar')).toBeDisabled();
  });

  it('shows a neutral placeholder, not the first option, before a reason is selected', () => {
    render(<OpportunityLostCancelledGateModal />, { wrapper: Wrapper });
    openGate({ sourceStageValue: 'ENTRY', destinationStageValue: 'LOST' });

    const lossReasonLabel = screen.getByTestId(
      'opportunity-lost-cancelled-gate-modal-loss-reason-selected-label',
    );

    expect(lossReasonLabel).not.toHaveTextContent('Preço');
    expect(lossReasonLabel).toHaveTextContent('Selecionar...');
  });

  it('advances to Lost with the selected reason from the Entrada stage', async () => {
    const user = userEvent.setup();
    render(<OpportunityLostCancelledGateModal />, { wrapper: Wrapper });
    openGate({ sourceStageValue: 'ENTRY', destinationStageValue: 'LOST' });

    await user.selectOptions(
      screen.getByLabelText('Motivo da perda/cancelamento'),
      ['NO_RESPONSE'],
    );

    expect(screen.getByText('Confirmar')).not.toBeDisabled();
    await user.click(screen.getByText('Confirmar'));

    expect(mockUpdateOneRecord).toHaveBeenCalledWith({
      objectNameSingular: CoreObjectNameSingular.Opportunity,
      idToUpdate: 'opportunity-1',
      updateOneRecordInput: {
        eventProcessStage: 'LOST',
        eventLossReason: 'NO_RESPONSE',
      },
    });
  });

  it('advances to Cancelled with the selected reason from a later stage', async () => {
    const user = userEvent.setup();
    render(<OpportunityLostCancelledGateModal />, { wrapper: Wrapper });
    openGate({
      sourceStageValue: 'PRODUCTION_FORMALIZATION_EVENT',
      destinationStageValue: 'CANCELLED',
    });

    await user.selectOptions(
      screen.getByLabelText('Motivo da perda/cancelamento'),
      ['PRICE'],
    );

    expect(screen.getByText('Confirmar')).not.toBeDisabled();
    await user.click(screen.getByText('Confirmar'));

    expect(mockUpdateOneRecord).toHaveBeenCalledWith({
      objectNameSingular: CoreObjectNameSingular.Opportunity,
      idToUpdate: 'opportunity-1',
      updateOneRecordInput: {
        eventProcessStage: 'CANCELLED',
        eventLossReason: 'PRICE',
      },
    });
  });
});
