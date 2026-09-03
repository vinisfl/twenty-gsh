import { act, render, screen } from '@testing-library/react';
import { type ReactNode } from 'react';
import userEvent from '@testing-library/user-event';
import { CoreObjectNameSingular } from 'twenty-shared/types';

import { OpportunityQualificationGateModal } from '@/object-record/record-persistence-gate/components/OpportunityQualificationGateModal';
import { opportunityStageAdvanceGateHandlerState } from '@/object-record/record-persistence-gate/states/opportunityStageAdvanceGateHandlerState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const mockUpdateOneRecord = jest.fn();
const mockCreateCorporateEvent = jest.fn();
const mockCreateTask = jest.fn();
const mockCreateTaskTarget = jest.fn();
const mockOpenModal = jest.fn();
const mockCloseModal = jest.fn();
const translatedMessages: Record<string, string> = {
  HN6ic2: 'Tipo de evento',
  tbO7pJ: 'Público estimado',
  d5zxa4: 'Local',
  'W+HvlL': 'Cidade',
  '/gwQhm': 'Data do evento',
  'd/vJMB': 'Valor estimado (R$)',
  he9Wyu: 'Orçamento compatível',
  ytcDq7: 'Cancelar',
  'hY+loZ': 'Avançar',
  vyUD5d: 'Montar e enviar proposta',
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
      ? {
          records: [
            {
              id: 'opportunity-1',
              name: 'Confraternização de fim de ano',
              ownerId: 'owner-1',
            },
          ],
          loading: false,
        }
      : { records: [], loading: false },
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
      case 'corporateEvent':
        return { createOneRecord: mockCreateCorporateEvent };
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

jest.mock('@/ui/input/components/internal/date/hooks/useUserTimezone', () => ({
  useUserTimezone: () => ({ userTimezone: 'America/Sao_Paulo' }),
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
  Checkbox: ({
    checked,
    onCheckedChange,
    'aria-label': ariaLabel,
  }: {
    checked: boolean;
    onCheckedChange: (value: boolean) => void;
    'aria-label': string;
  }) => (
    <button aria-label={ariaLabel} onClick={() => onCheckedChange(!checked)}>
      {checked ? 'checked' : 'unchecked'}
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
        sourceStageValue: 'QUALIFICATION',
        destinationStageValue: 'PROPOSAL_NEGOTIATION',
      }),
    ).toBe(false);
  });
};

const fillRequiredFields = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.selectOptions(screen.getByLabelText('Tipo de evento'), [
    'COFFEE_BREAK',
  ]);
  await user.type(screen.getByLabelText('Público estimado'), '80');
  await user.type(screen.getByLabelText('Local'), 'Casa GSH');
  await user.type(screen.getByLabelText('Cidade'), 'São Paulo');
  await user.type(screen.getByLabelText('Data do evento'), '2026-09-10T14:00');
  await user.type(screen.getByLabelText('Valor estimado (R$)'), '5000');
};

describe('OpportunityQualificationGateModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUpdateOneRecord.mockResolvedValue({ id: 'opportunity-1' });
    mockCreateCorporateEvent.mockResolvedValue({ id: 'event-1' });
    mockCreateTask.mockResolvedValue({ id: 'task-1' });
    mockCreateTaskTarget.mockResolvedValue({ id: 'task-target-1' });
    jest
      .spyOn(Date, 'now')
      .mockReturnValue(Date.parse('2026-09-03T12:00:00.000Z'));
  });

  afterEach(() => jest.restoreAllMocks());

  it('blocks only the qualification-to-proposal advancement and lets regressions persist natively', () => {
    render(<OpportunityQualificationGateModal />, { wrapper: Wrapper });

    const handler = jotaiStore.get(opportunityStageAdvanceGateHandlerState);

    expect(
      handler?.({
        recordId: 'opportunity-1',
        sourceStageValue: 'PROPOSAL_NEGOTIATION',
        destinationStageValue: 'QUALIFICATION',
      }),
    ).toBe(true);

    openGate();
    expect(mockOpenModal).toHaveBeenCalledWith(
      'opportunity-qualification-gate-modal',
    );
    expect(mockUpdateOneRecord).not.toHaveBeenCalled();
  });

  it('does not persist the advancement when the modal is closed', async () => {
    render(<OpportunityQualificationGateModal />, { wrapper: Wrapper });
    openGate();

    await userEvent.setup().click(screen.getByText('Cancelar'));

    expect(mockUpdateOneRecord).not.toHaveBeenCalled();
    expect(mockCreateTask).not.toHaveBeenCalled();
  });

  it('saves the required briefing, advances the stage, and creates the proposal task after confirmation', async () => {
    const user = userEvent.setup();
    render(<OpportunityQualificationGateModal />, { wrapper: Wrapper });
    openGate();
    await fillRequiredFields(user);

    expect(screen.getByText('Avançar')).toBeDisabled();
    await user.click(screen.getByLabelText('Orçamento compatível'));

    await user.click(screen.getByText('Avançar'));

    expect(mockCreateCorporateEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'COFFEE_BREAK',
        city: 'São Paulo',
        estimatedAudience: 80,
        opportunityId: 'opportunity-1',
      }),
    );
    expect(mockUpdateOneRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        objectNameSingular: CoreObjectNameSingular.Opportunity,
        idToUpdate: 'opportunity-1',
        updateOneRecordInput: expect.objectContaining({
          eventProcessStage: 'PROPOSAL_NEGOTIATION',
          eventAudience: 80,
          eventLocation: 'Casa GSH',
          amount: { amountMicros: 5_000_000_000, currencyCode: 'BRL' },
        }),
      }),
    );
    expect(mockCreateTask).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Montar e enviar proposta',
        assigneeId: 'owner-1',
        dueAt: '2026-09-04T12:00:00.000Z',
      }),
    );
    expect(mockCreateTaskTarget).toHaveBeenCalledWith({
      taskId: 'task-1',
      targetOpportunityId: 'opportunity-1',
    });
  });
});
