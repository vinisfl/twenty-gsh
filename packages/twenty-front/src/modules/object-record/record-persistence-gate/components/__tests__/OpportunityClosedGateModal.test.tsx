import { act, render, screen } from '@testing-library/react';
import { type ReactNode } from 'react';
import userEvent from '@testing-library/user-event';
import { CoreObjectNameSingular } from 'twenty-shared/types';

import { OpportunityClosedGateModal } from '@/object-record/record-persistence-gate/components/OpportunityClosedGateModal';
import { opportunityStageAdvanceGateHandlerState } from '@/object-record/record-persistence-gate/states/opportunityStageAdvanceGateHandlerState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const mockUpdateOneRecord = jest.fn();
const mockCreateCorporateEvent = jest.fn();
const mockOpenModal = jest.fn();
const mockCloseModal = jest.fn();

let opportunityRecords: unknown[] = [];
let corporateEventRecords: unknown[] = [];

const translatedMessages: Record<string, string> = {
  ytcDq7: 'Cancelar',
  iQ9YNa: 'Encerrar',
  pYgs50: 'Contrato',
  'gF/za2': 'Status da execução',
  '1itVMm': 'Montagem',
  zPLjjH: 'Deslocamento',
  h7Fop8: 'Abastecimento',
  wadLSI: 'Equipe',
  fSAwD4: 'Encerrar oportunidade',
  RJ8Fj3:
    'Confirme o contrato assinado, a execução concluída e o checklist logístico para encerrar esta oportunidade.',
  '1oBsHD': 'Carregando dados do evento…',
  yE2evI:
    'Nenhum evento vinculado a esta oportunidade. Vincule um evento antes de encerrar.',
  HObCAi: 'Criar e vincular evento',
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
      : { records: corporateEventRecords, loading: false },
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
    if (objectNameSingular === 'corporateEvent') {
      return { createOneRecord: mockCreateCorporateEvent };
    }

    throw new Error(`Unexpected object: ${objectNameSingular}`);
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

const Wrapper = getJestMetadataAndApolloMocksWrapper({ apolloMocks: [] });

const openGate = () => {
  const handler = jotaiStore.get(opportunityStageAdvanceGateHandlerState);

  act(() => {
    expect(
      handler?.({
        recordId: 'opportunity-1',
        sourceStageValue: 'PRODUCTION_FORMALIZATION_EVENT',
        destinationStageValue: 'CLOSED',
      }),
    ).toBe(false);
  });
};

describe('OpportunityClosedGateModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    opportunityRecords = [
      {
        id: 'opportunity-1',
        name: 'Confraternização de fim de ano',
        contractStatus: 'SIGNED',
      },
    ];
    corporateEventRecords = [
      {
        id: 'event-1',
        opportunityId: 'opportunity-1',
        executionStatus: 'COMPLETED',
        assemblyStatus: 'READY',
        travelStatus: 'NOT_APPLICABLE',
        supplyStatus: 'READY',
        teamStatus: 'READY',
      },
    ];
    mockUpdateOneRecord.mockResolvedValue({ id: 'opportunity-1' });
    mockCreateCorporateEvent.mockResolvedValue({
      id: 'event-created',
      name: 'Confraternização de fim de ano',
      executionStatus: null,
      assemblyStatus: null,
      travelStatus: null,
      supplyStatus: null,
      teamStatus: null,
    });
  });

  it('blocks only the production-to-closed advancement and lets regressions persist natively', () => {
    render(<OpportunityClosedGateModal />, { wrapper: Wrapper });

    const handler = jotaiStore.get(opportunityStageAdvanceGateHandlerState);

    expect(
      handler?.({
        recordId: 'opportunity-1',
        sourceStageValue: 'CLOSED',
        destinationStageValue: 'PRODUCTION_FORMALIZATION_EVENT',
      }),
    ).toBe(true);

    openGate();
    expect(mockOpenModal).toHaveBeenCalledWith('opportunity-closed-gate-modal');
    expect(mockUpdateOneRecord).not.toHaveBeenCalled();
  });

  it('does not persist the advancement when the modal is closed', () => {
    render(<OpportunityClosedGateModal />, { wrapper: Wrapper });
    openGate();

    act(() => {
      screen.getByText('Cancelar').click();
    });

    expect(mockUpdateOneRecord).not.toHaveBeenCalled();
  });

  it('keeps the advance button disabled when the checklist is incomplete', () => {
    corporateEventRecords = [
      {
        id: 'event-1',
        opportunityId: 'opportunity-1',
        executionStatus: 'COMPLETED',
        assemblyStatus: 'PENDING',
        travelStatus: 'NOT_APPLICABLE',
        supplyStatus: 'READY',
        teamStatus: 'READY',
      },
    ];
    render(<OpportunityClosedGateModal />, { wrapper: Wrapper });
    openGate();

    expect(screen.getByText('Encerrar')).toBeDisabled();
  });

  it('keeps the advance button disabled when the contract is not signed', () => {
    opportunityRecords = [
      {
        id: 'opportunity-1',
        name: 'Confraternização de fim de ano',
        contractStatus: 'SENT',
      },
    ];
    render(<OpportunityClosedGateModal />, { wrapper: Wrapper });
    openGate();

    expect(screen.getByText('Encerrar')).toBeDisabled();
  });

  it('keeps the advance button disabled when the event execution is not completed', () => {
    corporateEventRecords = [
      {
        id: 'event-1',
        opportunityId: 'opportunity-1',
        executionStatus: 'IN_PROGRESS',
        assemblyStatus: 'READY',
        travelStatus: 'NOT_APPLICABLE',
        supplyStatus: 'READY',
        teamStatus: 'READY',
      },
    ];
    render(<OpportunityClosedGateModal />, { wrapper: Wrapper });
    openGate();

    expect(screen.getByText('Encerrar')).toBeDisabled();
  });

  it('keeps the advance button disabled and explains when no event is linked', () => {
    corporateEventRecords = [];
    render(<OpportunityClosedGateModal />, { wrapper: Wrapper });
    openGate();

    expect(screen.getByText('Encerrar')).toBeDisabled();
    expect(screen.getByText(/Nenhum evento vinculado/)).toBeInTheDocument();
  });

  it('creates and links a missing event before completing the same advancement', async () => {
    corporateEventRecords = [];
    const user = userEvent.setup();
    render(<OpportunityClosedGateModal />, { wrapper: Wrapper });
    openGate();

    await user.click(screen.getByText('Criar e vincular evento'));

    expect(mockCreateCorporateEvent).toHaveBeenCalledWith({
      name: 'Confraternização de fim de ano',
      opportunityId: 'opportunity-1',
    });
    expect(screen.getByLabelText('Status da execução')).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText('Status da execução'), [
      'COMPLETED',
    ]);
    await user.selectOptions(screen.getByLabelText('Montagem'), ['READY']);
    await user.selectOptions(screen.getByLabelText('Deslocamento'), [
      'NOT_APPLICABLE',
    ]);
    await user.selectOptions(screen.getByLabelText('Abastecimento'), ['READY']);
    await user.selectOptions(screen.getByLabelText('Equipe'), ['READY']);
    await user.click(screen.getByText('Encerrar'));

    expect(mockUpdateOneRecord).toHaveBeenCalledWith({
      objectNameSingular: 'corporateEvent',
      idToUpdate: 'event-created',
      updateOneRecordInput: {
        executionStatus: 'COMPLETED',
        assemblyStatus: 'READY',
        travelStatus: 'NOT_APPLICABLE',
        supplyStatus: 'READY',
        teamStatus: 'READY',
      },
    });
    expect(mockUpdateOneRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        objectNameSingular: CoreObjectNameSingular.Opportunity,
        idToUpdate: 'opportunity-1',
        updateOneRecordInput: expect.objectContaining({
          eventProcessStage: 'CLOSED',
        }),
      }),
    );
  });

  it('keeps the gate modal open while creating a missing event', async () => {
    corporateEventRecords = [];
    mockCreateCorporateEvent.mockImplementation(() => new Promise(() => {}));
    const user = userEvent.setup();
    render(<OpportunityClosedGateModal />, { wrapper: Wrapper });
    openGate();

    await user.click(screen.getByText('Criar e vincular evento'));

    expect(screen.getByText('Cancelar')).toBeDisabled();
  });

  it('advances the stage when all gate criteria are already met', async () => {
    const user = userEvent.setup();
    render(<OpportunityClosedGateModal />, { wrapper: Wrapper });
    openGate();

    expect(screen.getByText('Encerrar')).not.toBeDisabled();
    await user.click(screen.getByText('Encerrar'));

    expect(mockUpdateOneRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        objectNameSingular: CoreObjectNameSingular.Opportunity,
        idToUpdate: 'opportunity-1',
        updateOneRecordInput: expect.objectContaining({
          eventProcessStage: 'CLOSED',
          contractStatus: 'SIGNED',
        }),
      }),
    );
    expect(mockUpdateOneRecord).not.toHaveBeenCalledWith(
      expect.objectContaining({ objectNameSingular: 'corporateEvent' }),
    );
  });

  it('lets completing the checklist in the modal unblock and persist the advance', async () => {
    corporateEventRecords = [
      {
        id: 'event-1',
        opportunityId: 'opportunity-1',
        executionStatus: 'COMPLETED',
        assemblyStatus: 'PENDING',
        travelStatus: 'NOT_APPLICABLE',
        supplyStatus: 'READY',
        teamStatus: 'READY',
      },
    ];
    const user = userEvent.setup();
    render(<OpportunityClosedGateModal />, { wrapper: Wrapper });
    openGate();

    expect(screen.getByText('Encerrar')).toBeDisabled();

    await user.selectOptions(screen.getByLabelText('Montagem'), ['READY']);

    expect(screen.getByText('Encerrar')).not.toBeDisabled();
    await user.click(screen.getByText('Encerrar'));

    expect(mockUpdateOneRecord).toHaveBeenCalledWith({
      objectNameSingular: 'corporateEvent',
      idToUpdate: 'event-1',
      updateOneRecordInput: {
        executionStatus: 'COMPLETED',
        assemblyStatus: 'READY',
        travelStatus: 'NOT_APPLICABLE',
        supplyStatus: 'READY',
        teamStatus: 'READY',
      },
    });
    expect(mockUpdateOneRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        objectNameSingular: CoreObjectNameSingular.Opportunity,
        idToUpdate: 'opportunity-1',
        updateOneRecordInput: expect.objectContaining({
          eventProcessStage: 'CLOSED',
        }),
      }),
    );
  });
});
