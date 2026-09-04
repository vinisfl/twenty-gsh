import { act, render, screen } from '@testing-library/react';
import { type ReactNode } from 'react';
import userEvent from '@testing-library/user-event';
import { CoreObjectNameSingular } from 'twenty-shared/types';

import { OpportunityAcceptanceGateModal } from '@/object-record/record-persistence-gate/components/OpportunityAcceptanceGateModal';
import { opportunityStageAdvanceGateHandlerState } from '@/object-record/record-persistence-gate/states/opportunityStageAdvanceGateHandlerState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const mockUpdateOneRecord = jest.fn();
const mockCreateTask = jest.fn();
const mockCreateTaskTarget = jest.fn();
const mockOpenModal = jest.fn();
const mockCloseModal = jest.fn();

let opportunityRecords: unknown[] = [];
let proposalRecords: unknown[] = [];

const translatedMessages: Record<string, string> = {
  ytcDq7: 'Cancelar',
  'hY+loZ': 'Avançar',
  djY9gY: 'Status da proposta',
  j2sq5K: 'Rascunho',
  D4Aohv: 'Enviada',
  '8ShcFl': 'Substituída',
  d0Yj8q: 'Aceita',
  '9K9Wi4': 'Recusada',
  hft8Em: 'Valor fechado (R$)',
  XRQmS4: 'Evidência do aceite',
  NJGXuk:
    'Nenhuma proposta encontrada para esta oportunidade. Crie uma proposta antes de avançar.',
};

jest.mock('@lingui/react/macro', () => ({
  useLingui: () => ({
    i18n: {
      _: ({ id }: { id: string }) => translatedMessages[id] ?? id,
    },
  }),
}));

jest.mock('@lingui/react', () => ({
  useLingui: () => ({
    i18n: {
      _: ({ id }: { id: string }) => translatedMessages[id] ?? id,
    },
  }),
}));

jest.mock('@/object-record/hooks/useFindManyRecords', () => ({
  useFindManyRecords: ({
    objectNameSingular,
  }: {
    objectNameSingular: string;
  }) =>
    objectNameSingular === CoreObjectNameSingular.Opportunity
      ? { records: opportunityRecords, loading: false }
      : { records: proposalRecords, loading: false },
}));

jest.mock('@/object-record/hooks/useUpdateOneRecord', () => ({
  useUpdateOneRecord: () => ({ updateOneRecord: mockUpdateOneRecord }),
}));

jest.mock('@/object-record/hooks/useCreateOneRecord', () => ({
  useCreateOneRecord: ({
    objectNameSingular,
  }: {
    objectNameSingular: string;
  }) => {
    switch (objectNameSingular) {
      case CoreObjectNameSingular.Task:
        return { createOneRecord: mockCreateTask };
      case CoreObjectNameSingular.TaskTarget:
        return { createOneRecord: mockCreateTaskTarget };
      default:
        throw new Error(`Unexpected object: ${objectNameSingular}`);
    }
  },
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

jest.mock('@/ui/utilities/state/jotai/hooks/useAtomStateValue', () => ({
  useAtomStateValue: () => ({ id: 'current-member-1' }),
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

jest.mock('@/ui/input/components/Select', () => ({
  Select: ({
    dropdownId,
    label,
    value,
    options,
    onChange,
  }: {
    dropdownId: string;
    label: string;
    value: string;
    options: { value: string; label: string }[];
    onChange: (value: string) => void;
  }) => (
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
  ),
}));

jest.mock('@/ui/input/components/SettingsTextInput', () => ({
  SettingsTextInput: ({
    label,
    value,
    onChange,
    type,
  }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
  }) => (
    <label>
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  ),
}));

const Wrapper = getJestMetadataAndApolloMocksWrapper({ apolloMocks: [] });

const openGate = () => {
  const handler = jotaiStore.get(opportunityStageAdvanceGateHandlerState);

  act(() => {
    expect(
      handler?.({
        recordId: 'opportunity-1',
        sourceStageValue: 'PROPOSAL_NEGOTIATION',
        destinationStageValue: 'ACCEPTANCE_REGISTRATION',
      }),
    ).toBe(false);
  });
};

describe('OpportunityAcceptanceGateModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    opportunityRecords = [
      {
        id: 'opportunity-1',
        name: 'Confraternização de fim de ano',
        ownerId: 'owner-1',
        eventClosedAmount: { amountMicros: 5_000_000_000, currencyCode: 'BRL' },
        eventAcceptanceEvidence: 'https://mail.example.com/aceite-cliente',
      },
    ];
    proposalRecords = [{ id: 'proposal-1', version: 1, status: 'ACCEPTED' }];
    mockUpdateOneRecord.mockResolvedValue({ id: 'opportunity-1' });
    mockCreateTask.mockResolvedValue({ id: 'task-1' });
    mockCreateTaskTarget.mockResolvedValue({ id: 'task-target-1' });
  });

  it('blocks only the proposal-to-acceptance advancement and lets regressions persist natively', () => {
    render(<OpportunityAcceptanceGateModal />, { wrapper: Wrapper });

    const handler = jotaiStore.get(opportunityStageAdvanceGateHandlerState);

    expect(
      handler?.({
        recordId: 'opportunity-1',
        sourceStageValue: 'ACCEPTANCE_REGISTRATION',
        destinationStageValue: 'PROPOSAL_NEGOTIATION',
      }),
    ).toBe(true);

    openGate();
    expect(mockOpenModal).toHaveBeenCalledWith(
      'opportunity-acceptance-gate-modal',
    );
    expect(mockUpdateOneRecord).not.toHaveBeenCalled();
  });

  it('does not persist the advancement when the modal is closed', () => {
    render(<OpportunityAcceptanceGateModal />, { wrapper: Wrapper });
    openGate();

    act(() => {
      screen.getByText('Cancelar').click();
    });

    expect(mockUpdateOneRecord).not.toHaveBeenCalled();
    expect(mockCreateTask).not.toHaveBeenCalled();
  });

  it('keeps the advance button disabled when the latest proposal is not accepted', () => {
    proposalRecords = [{ id: 'proposal-1', version: 1, status: 'SENT' }];
    render(<OpportunityAcceptanceGateModal />, { wrapper: Wrapper });
    openGate();

    expect(screen.getByText('Avançar')).toBeDisabled();
  });

  it('lets the user resolve an unaccepted proposal directly from the modal', async () => {
    proposalRecords = [{ id: 'proposal-1', version: 1, status: 'SENT' }];
    const user = userEvent.setup();
    render(<OpportunityAcceptanceGateModal />, { wrapper: Wrapper });
    openGate();

    expect(screen.getByText('Avançar')).toBeDisabled();

    await user.selectOptions(screen.getByLabelText('Status da proposta'), [
      'ACCEPTED',
    ]);

    expect(screen.getByText('Avançar')).not.toBeDisabled();

    await user.click(screen.getByText('Avançar'));

    expect(mockUpdateOneRecord).toHaveBeenCalledWith({
      objectNameSingular: 'eventProposal',
      idToUpdate: 'proposal-1',
      updateOneRecordInput: { status: 'ACCEPTED' },
    });
  });

  it('keeps the advance button disabled when the closed amount is missing', () => {
    opportunityRecords = [
      {
        id: 'opportunity-1',
        name: 'Confraternização de fim de ano',
        ownerId: 'owner-1',
        eventClosedAmount: null,
        eventAcceptanceEvidence: 'https://mail.example.com/aceite-cliente',
      },
    ];
    render(<OpportunityAcceptanceGateModal />, { wrapper: Wrapper });
    openGate();

    expect(screen.getByText('Avançar')).toBeDisabled();
  });

  it('lets the user resolve a missing closed amount directly from the modal', async () => {
    opportunityRecords = [
      {
        id: 'opportunity-1',
        name: 'Confraternização de fim de ano',
        ownerId: 'owner-1',
        eventClosedAmount: null,
        eventAcceptanceEvidence: 'https://mail.example.com/aceite-cliente',
      },
    ];
    const user = userEvent.setup();
    render(<OpportunityAcceptanceGateModal />, { wrapper: Wrapper });
    openGate();

    expect(screen.getByText('Avançar')).toBeDisabled();

    await user.type(screen.getByLabelText('Valor fechado (R$)'), '4200');

    expect(screen.getByText('Avançar')).not.toBeDisabled();

    await user.click(screen.getByText('Avançar'));

    expect(mockUpdateOneRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        objectNameSingular: CoreObjectNameSingular.Opportunity,
        idToUpdate: 'opportunity-1',
        updateOneRecordInput: expect.objectContaining({
          eventClosedAmount: {
            amountMicros: 4_200_000_000,
            currencyCode: 'BRL',
          },
        }),
      }),
    );
  });

  it('allows advancing with a closed amount of zero, since "filled" is not "positive"', () => {
    opportunityRecords = [
      {
        id: 'opportunity-1',
        name: 'Confraternização de fim de ano',
        ownerId: 'owner-1',
        eventClosedAmount: { amountMicros: 0, currencyCode: 'BRL' },
        eventAcceptanceEvidence: 'https://mail.example.com/aceite-cliente',
      },
    ];
    render(<OpportunityAcceptanceGateModal />, { wrapper: Wrapper });
    openGate();

    expect(screen.getByText('Avançar')).not.toBeDisabled();
  });

  it('keeps the advance button disabled when the acceptance evidence is missing', () => {
    opportunityRecords = [
      {
        id: 'opportunity-1',
        name: 'Confraternização de fim de ano',
        ownerId: 'owner-1',
        eventClosedAmount: { amountMicros: 5_000_000_000, currencyCode: 'BRL' },
        eventAcceptanceEvidence: null,
      },
    ];
    render(<OpportunityAcceptanceGateModal />, { wrapper: Wrapper });
    openGate();

    expect(screen.getByText('Avançar')).toBeDisabled();
  });

  it('lets the user resolve missing acceptance evidence directly from the modal', async () => {
    opportunityRecords = [
      {
        id: 'opportunity-1',
        name: 'Confraternização de fim de ano',
        ownerId: 'owner-1',
        eventClosedAmount: { amountMicros: 5_000_000_000, currencyCode: 'BRL' },
        eventAcceptanceEvidence: null,
      },
    ];
    const user = userEvent.setup();
    render(<OpportunityAcceptanceGateModal />, { wrapper: Wrapper });
    openGate();

    expect(screen.getByText('Avançar')).toBeDisabled();

    await user.type(
      screen.getByLabelText('Evidência do aceite'),
      'https://mail.example.com/aceite-cliente',
    );

    expect(screen.getByText('Avançar')).not.toBeDisabled();

    await user.click(screen.getByText('Avançar'));

    expect(mockUpdateOneRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        objectNameSingular: CoreObjectNameSingular.Opportunity,
        idToUpdate: 'opportunity-1',
        updateOneRecordInput: expect.objectContaining({
          eventAcceptanceEvidence: 'https://mail.example.com/aceite-cliente',
        }),
      }),
    );
  });

  it('only considers the latest proposal version when checking acceptance', () => {
    proposalRecords = [
      { id: 'proposal-1', version: 1, status: 'ACCEPTED' },
      { id: 'proposal-2', version: 2, status: 'SENT' },
    ];
    render(<OpportunityAcceptanceGateModal />, { wrapper: Wrapper });
    openGate();

    expect(screen.getByText('Avançar')).toBeDisabled();
  });

  it('keeps the advance button disabled and explains when no proposal exists', () => {
    proposalRecords = [];
    render(<OpportunityAcceptanceGateModal />, { wrapper: Wrapper });
    openGate();

    expect(screen.getByText('Avançar')).toBeDisabled();
    expect(screen.getByText(/Nenhuma proposta encontrada/)).toBeInTheDocument();
  });

  it('advances the stage and creates the registration-request task after confirmation', async () => {
    const user = userEvent.setup();
    render(<OpportunityAcceptanceGateModal />, { wrapper: Wrapper });
    openGate();

    expect(screen.getByText('Avançar')).not.toBeDisabled();
    await user.click(screen.getByText('Avançar'));

    expect(mockCreateTask).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Solicitar ficha cadastral ao cliente',
        assigneeId: 'owner-1',
      }),
    );
    expect(mockCreateTaskTarget).toHaveBeenCalledWith({
      taskId: 'task-1',
      targetOpportunityId: 'opportunity-1',
    });
    expect(mockUpdateOneRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        objectNameSingular: CoreObjectNameSingular.Opportunity,
        idToUpdate: 'opportunity-1',
        updateOneRecordInput: expect.objectContaining({
          eventProcessStage: 'ACCEPTANCE_REGISTRATION',
        }),
      }),
    );
  });
});
