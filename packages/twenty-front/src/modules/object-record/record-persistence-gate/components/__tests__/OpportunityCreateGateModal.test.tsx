import { act, fireEvent, render, screen } from '@testing-library/react';
import { CoreObjectNameSingular } from 'twenty-shared/types';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { OpportunityCreateGateModal } from '@/object-record/record-persistence-gate/components/OpportunityCreateGateModal';
import { opportunityCreateGateHandlerState } from '@/object-record/record-persistence-gate/states/opportunityCreateGateHandlerState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const mockCreateOpportunity = jest.fn();
const mockCreateCompany = jest.fn();
const mockCreateTask = jest.fn();
const mockCreateTaskTarget = jest.fn();

jest.mock('@/object-record/hooks/useCreateOneRecord', () => ({
  useCreateOneRecord: ({
    objectNameSingular,
  }: {
    objectNameSingular: string;
  }) => {
    switch (objectNameSingular) {
      case CoreObjectNameSingular.Opportunity:
        return { createOneRecord: mockCreateOpportunity };
      case CoreObjectNameSingular.Company:
        return { createOneRecord: mockCreateCompany };
      case CoreObjectNameSingular.Task:
        return { createOneRecord: mockCreateTask };
      case CoreObjectNameSingular.TaskTarget:
        return { createOneRecord: mockCreateTaskTarget };
      default:
        throw new Error(
          `Unexpected objectNameSingular in test double: ${objectNameSingular}`,
        );
    }
  },
}));

jest.mock(
  '@/object-record/record-field/ui/form-types/components/FormSingleRecordPicker',
  () => ({
    FormSingleRecordPicker: ({
      onChange,
      testId,
    }: {
      onChange: (value: string) => void;
      testId?: string;
    }) => (
      <button data-testid={testId} onClick={() => onChange('company-1')}>
        pick company
      </button>
    ),
  }),
);

jest.mock('@/ui/input/components/Select', () => ({
  Select: ({
    dropdownId,
    value,
    options,
    onChange,
  }: {
    dropdownId: string;
    value: string;
    options: { value: string; label: string }[];
    onChange: (value: string) => void;
  }) => (
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
  ),
}));

const Wrapper = getJestMetadataAndApolloMocksWrapper({ apolloMocks: [] });

const fillRequiredFields = () => {
  fireEvent.change(screen.getByLabelText('Nome do evento'), {
    target: { value: 'Confraternização de fim de ano' },
  });
  fireEvent.click(screen.getByTestId('opportunity-create-gate-modal-company'));
  fireEvent.change(
    screen.getByTestId('opportunity-create-gate-modal-modality'),
    { target: { value: 'INTERNAL' } },
  );
  fireEvent.change(screen.getByLabelText('Data prevista do evento'), {
    target: { value: '2026-09-10T14:30' },
  });
  fireEvent.change(screen.getByLabelText('Valor estimado (R$)'), {
    target: { value: '5000' },
  });
  fireEvent.change(screen.getByTestId('opportunity-create-gate-modal-source'), {
    target: { value: 'WHATSAPP' },
  });
};

describe('OpportunityCreateGateModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jotaiStore.set(currentWorkspaceMemberState.atom, {
      id: 'workspace-member-1',
    } as never);
    mockCreateOpportunity.mockResolvedValue({ id: 'opportunity-1' });
    mockCreateCompany.mockResolvedValue({ id: 'company-1' });
    mockCreateTask.mockResolvedValue({ id: 'task-1' });
    mockCreateTaskTarget.mockResolvedValue({ id: 'task-target-1' });
  });

  it('renders nothing until the Opportunity object metadata item is available', () => {
    const WrapperWithoutMetadata = getJestMetadataAndApolloMocksWrapper({
      apolloMocks: [],
      objectMetadataItems: getTestEnrichedObjectMetadataItemsMock().filter(
        (item) => item.nameSingular !== CoreObjectNameSingular.Opportunity,
      ),
    });

    render(<OpportunityCreateGateModal />, {
      wrapper: WrapperWithoutMetadata,
    });

    const handler = jotaiStore.get(opportunityCreateGateHandlerState);

    expect(handler).toBeUndefined();
  });

  it('registers a handler that always blocks native creation, without creating anything by itself', () => {
    render(<OpportunityCreateGateModal />, { wrapper: Wrapper });

    const handler = jotaiStore.get(opportunityCreateGateHandlerState);

    let shouldProceedNatively: boolean | undefined;
    act(() => {
      shouldProceedNatively = handler?.({
        recordInput: { eventProcessStage: 'ENTRY' },
      });
    });

    expect(shouldProceedNatively).toBe(false);
    expect(mockCreateOpportunity).not.toHaveBeenCalled();
  });

  it('does not create a record when the modal is closed without confirming', () => {
    render(<OpportunityCreateGateModal />, { wrapper: Wrapper });

    const handler = jotaiStore.get(opportunityCreateGateHandlerState);
    act(() => {
      handler?.({ recordInput: {} });
    });

    fireEvent.click(screen.getByText('Cancelar'));

    expect(mockCreateOpportunity).not.toHaveBeenCalled();
    expect(mockCreateTask).not.toHaveBeenCalled();
  });

  it('creates the opportunity and the initial-contact task when confirmed with all required fields', async () => {
    render(<OpportunityCreateGateModal />, { wrapper: Wrapper });

    const handler = jotaiStore.get(opportunityCreateGateHandlerState);
    act(() => {
      handler?.({ recordInput: { eventProcessStage: 'ENTRY' } });
    });

    fillRequiredFields();

    await act(async () => {
      fireEvent.click(screen.getByText('Criar'));
    });

    expect(mockCreateOpportunity).toHaveBeenCalledWith(
      expect.objectContaining({
        eventProcessStage: 'ENTRY',
        name: 'Confraternização de fim de ano',
        companyId: 'company-1',
        eventModality: 'INTERNAL',
        eventAt: new Date('2026-09-10T14:30').toISOString(),
        amount: { amountMicros: 5_000_000_000, currencyCode: 'BRL' },
        eventSource: 'WHATSAPP',
        ownerId: 'workspace-member-1',
      }),
    );

    expect(mockCreateTask).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Fazer contato inicial e capturar briefing',
        status: 'TODO',
        assigneeId: 'workspace-member-1',
      }),
    );

    expect(mockCreateTaskTarget).toHaveBeenCalledWith({
      taskId: 'task-1',
      targetOpportunityId: 'opportunity-1',
    });
  });

  it('keeps the confirm action disabled until every required field is filled', async () => {
    render(<OpportunityCreateGateModal />, { wrapper: Wrapper });

    const handler = jotaiStore.get(opportunityCreateGateHandlerState);
    act(() => {
      handler?.({ recordInput: {} });
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Criar'));
    });

    expect(mockCreateOpportunity).not.toHaveBeenCalled();
  });
});
