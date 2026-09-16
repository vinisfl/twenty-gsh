import { act, render, screen } from '@testing-library/react';
import { type ReactNode } from 'react';
import userEvent from '@testing-library/user-event';
import { CoreObjectNameSingular } from 'twenty-shared/types';

import { OpportunityProductionGateModal } from '@/object-record/record-persistence-gate/components/OpportunityProductionGateModal';
import { opportunityStageAdvanceGateHandlerState } from '@/object-record/record-persistence-gate/states/opportunityStageAdvanceGateHandlerState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const mockUpdateOneRecord = jest.fn();
const mockCreateTask = jest.fn();
const mockCreateTaskTarget = jest.fn();
const mockOpenModal = jest.fn();
const mockCloseModal = jest.fn();
const mockEnqueueErrorSnackBar = jest.fn();

let opportunityRecords: unknown[] = [];
let companyRecords: unknown[] = [];

const translatedMessages: Record<string, string> = {
  ytcDq7: 'Cancelar',
  'hY+loZ': 'Avançar',
  hft8Em: 'Valor fechado (R$)',
  XRQmS4: 'Evidência do aceite',
  zQ8fLI: 'Razão social',
  hurL0d: 'CNPJ',
  opli6l: 'E-mail de faturamento',
  KC16Y9: 'Avançar para produção/formalização',
  CDUC4t:
    'Confirme a evidência do aceite, o valor fechado e os dados fiscais da empresa para avançar esta oportunidade.',
  cQR0j0: 'Carregando dados da empresa…',
  hUOS1l:
    'Nenhuma empresa vinculada a esta oportunidade. Vincule uma empresa antes de avançar.',
  rygNCo: 'Link do e-mail, mensagem ou documento que confirma o aceite',
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
      : { records: companyRecords, loading: false },
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
  useSnackBar: () => ({ enqueueErrorSnackBar: mockEnqueueErrorSnackBar }),
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
        sourceStageValue: 'ACCEPTANCE_REGISTRATION',
        destinationStageValue: 'PRODUCTION_FORMALIZATION_EVENT',
      }),
    ).toBe(false);
  });
};

describe('OpportunityProductionGateModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    opportunityRecords = [
      {
        id: 'opportunity-1',
        name: 'Confraternização de fim de ano',
        ownerId: 'owner-1',
        companyId: 'company-1',
        eventClosedAmount: { amountMicros: 5_000_000_000, currencyCode: 'BRL' },
        eventAcceptanceEvidence: 'https://mail.example.com/aceite-cliente',
      },
    ];
    companyRecords = [
      {
        id: 'company-1',
        legalName: 'Gourmet e Companhia LTDA',
        taxId: '12.345.678/0001-90',
        billingEmail: 'faturamento@cliente.com',
      },
    ];
    mockUpdateOneRecord.mockResolvedValue({ id: 'opportunity-1' });
    mockCreateTask.mockResolvedValue({ id: 'task-1' });
    mockCreateTaskTarget.mockResolvedValue({ id: 'task-target-1' });
  });

  it('blocks only the acceptance-to-production advancement and lets regressions persist natively', () => {
    render(<OpportunityProductionGateModal />, { wrapper: Wrapper });

    const handler = jotaiStore.get(opportunityStageAdvanceGateHandlerState);

    expect(
      handler?.({
        recordId: 'opportunity-1',
        sourceStageValue: 'PRODUCTION_FORMALIZATION_EVENT',
        destinationStageValue: 'ACCEPTANCE_REGISTRATION',
      }),
    ).toBe(true);

    openGate();
    expect(mockOpenModal).toHaveBeenCalledWith(
      'opportunity-production-gate-modal',
    );
    expect(mockUpdateOneRecord).not.toHaveBeenCalled();
  });

  it('does not persist the advancement when the modal is closed', () => {
    render(<OpportunityProductionGateModal />, { wrapper: Wrapper });
    openGate();

    act(() => {
      screen.getByText('Cancelar').click();
    });

    expect(mockUpdateOneRecord).not.toHaveBeenCalled();
    expect(mockCreateTask).not.toHaveBeenCalled();
  });

  it('does not show fiscal fields when the company data is already complete', () => {
    render(<OpportunityProductionGateModal />, { wrapper: Wrapper });
    openGate();

    expect(screen.queryByLabelText('Razão social')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('CNPJ')).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText('E-mail de faturamento'),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Avançar')).not.toBeDisabled();
  });

  it('only asks for the fiscal fields that are missing on the company', () => {
    companyRecords = [
      {
        id: 'company-1',
        legalName: null,
        taxId: '12.345.678/0001-90',
        billingEmail: 'faturamento@cliente.com',
      },
    ];
    render(<OpportunityProductionGateModal />, { wrapper: Wrapper });
    openGate();

    expect(screen.getByLabelText('Razão social')).toBeInTheDocument();
    expect(screen.queryByLabelText('CNPJ')).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText('E-mail de faturamento'),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Avançar')).toBeDisabled();
  });

  it('writes filled-in fiscal data back to the Company object, not the Opportunity', async () => {
    companyRecords = [
      {
        id: 'company-1',
        legalName: null,
        taxId: null,
        billingEmail: null,
      },
    ];
    const user = userEvent.setup();
    render(<OpportunityProductionGateModal />, { wrapper: Wrapper });
    openGate();

    expect(screen.getByText('Avançar')).toBeDisabled();

    await user.type(
      screen.getByLabelText('Razão social'),
      'Gourmet e Companhia LTDA',
    );
    await user.type(screen.getByLabelText('CNPJ'), '12.345.678/0001-90');
    await user.type(
      screen.getByLabelText('E-mail de faturamento'),
      'faturamento@cliente.com',
    );

    expect(screen.getByText('Avançar')).not.toBeDisabled();

    await user.click(screen.getByText('Avançar'));

    expect(mockUpdateOneRecord).toHaveBeenCalledWith({
      objectNameSingular: CoreObjectNameSingular.Company,
      idToUpdate: 'company-1',
      updateOneRecordInput: {
        legalName: 'Gourmet e Companhia LTDA',
        taxId: '12.345.678/0001-90',
        billingEmail: 'faturamento@cliente.com',
      },
    });
  });

  it('keeps the advance button disabled when the closed amount is missing', () => {
    opportunityRecords = [
      {
        id: 'opportunity-1',
        name: 'Confraternização de fim de ano',
        ownerId: 'owner-1',
        companyId: 'company-1',
        eventClosedAmount: null,
        eventAcceptanceEvidence: 'https://mail.example.com/aceite-cliente',
      },
    ];
    render(<OpportunityProductionGateModal />, { wrapper: Wrapper });
    openGate();

    expect(screen.getByText('Avançar')).toBeDisabled();
  });

  it('keeps the advance button disabled when the acceptance evidence is missing', () => {
    opportunityRecords = [
      {
        id: 'opportunity-1',
        name: 'Confraternização de fim de ano',
        ownerId: 'owner-1',
        companyId: 'company-1',
        eventClosedAmount: { amountMicros: 5_000_000_000, currencyCode: 'BRL' },
        eventAcceptanceEvidence: null,
      },
    ];
    render(<OpportunityProductionGateModal />, { wrapper: Wrapper });
    openGate();

    expect(screen.getByText('Avançar')).toBeDisabled();
  });

  it('keeps the advance button disabled and explains when no company is linked', () => {
    opportunityRecords = [
      {
        id: 'opportunity-1',
        name: 'Confraternização de fim de ano',
        ownerId: 'owner-1',
        companyId: null,
        eventClosedAmount: { amountMicros: 5_000_000_000, currencyCode: 'BRL' },
        eventAcceptanceEvidence: 'https://mail.example.com/aceite-cliente',
      },
    ];
    companyRecords = [];
    render(<OpportunityProductionGateModal />, { wrapper: Wrapper });
    openGate();

    expect(screen.getByText('Avançar')).toBeDisabled();
    expect(screen.getByText(/Nenhuma empresa vinculada/)).toBeInTheDocument();
  });

  it('advances the stage and creates the complete formalization chain in order', async () => {
    const user = userEvent.setup();
    render(<OpportunityProductionGateModal />, { wrapper: Wrapper });
    openGate();

    expect(screen.getByText('Avançar')).not.toBeDisabled();
    await user.click(screen.getByText('Avançar'));

    expect(mockCreateTask).toHaveBeenCalledTimes(4);
    expect(mockCreateTask.mock.calls.map(([input]) => input)).toEqual([
      {
        title: 'Gerar Ordem de Serviço',
        status: 'TODO',
        assigneeId: 'owner-1',
      },
      {
        title: 'Preencher Formulário de Compra',
        status: 'TODO',
        assigneeId: 'owner-1',
      },
      {
        title: 'Acompanhar emissão de NF junto ao financeiro',
        status: 'TODO',
        assigneeId: 'owner-1',
      },
      {
        title: 'Gerar contrato',
        status: 'TODO',
        assigneeId: 'owner-1',
      },
    ]);
    expect(mockCreateTaskTarget).toHaveBeenCalledTimes(4);
    expect(mockCreateTaskTarget).toHaveBeenCalledWith({
      taskId: 'task-1',
      targetOpportunityId: 'opportunity-1',
    });
    expect(mockUpdateOneRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        objectNameSingular: CoreObjectNameSingular.Opportunity,
        idToUpdate: 'opportunity-1',
        updateOneRecordInput: expect.objectContaining({
          eventProcessStage: 'PRODUCTION_FORMALIZATION_EVENT',
        }),
      }),
    );
    expect(mockUpdateOneRecord).not.toHaveBeenCalledWith(
      expect.objectContaining({
        objectNameSingular: CoreObjectNameSingular.Company,
      }),
    );
  });

  it('keeps the stage advance when a formalization task cannot be created', async () => {
    mockCreateTask
      .mockResolvedValueOnce({ id: 'task-1' })
      .mockRejectedValueOnce(new Error('Task creation failed'));
    const user = userEvent.setup();
    render(<OpportunityProductionGateModal />, { wrapper: Wrapper });
    openGate();

    await user.click(screen.getByText('Avançar'));

    expect(mockUpdateOneRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        objectNameSingular: CoreObjectNameSingular.Opportunity,
        idToUpdate: 'opportunity-1',
        updateOneRecordInput: expect.objectContaining({
          eventProcessStage: 'PRODUCTION_FORMALIZATION_EVENT',
        }),
      }),
    );
    expect(mockCreateTask).toHaveBeenCalledTimes(4);
    expect(mockEnqueueErrorSnackBar).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.any(String) }),
    );
  });
});
