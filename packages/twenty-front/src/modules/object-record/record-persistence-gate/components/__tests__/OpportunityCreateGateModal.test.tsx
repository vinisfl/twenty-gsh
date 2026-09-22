import { act, fireEvent, render, screen } from '@testing-library/react';
import { type ReactNode } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { OpportunityCreateGateModal } from '@/object-record/record-persistence-gate/components/OpportunityCreateGateModal';
import { opportunityCreateGateHandlerState } from '@/object-record/record-persistence-gate/states/opportunityCreateGateHandlerState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const mockCreateOpportunity = jest.fn();
const mockCreateCompany = jest.fn();
const mockCreatePerson = jest.fn();
const mockCreateCorporateEvent = jest.fn();
const mockCreateEventProposal = jest.fn();
const mockCreateEventCatalog = jest.fn();
const mockCreateTask = jest.fn();
const mockCreateTaskTarget = jest.fn();
const mockUpdateOneRecord = jest.fn();

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
      case CoreObjectNameSingular.Person:
        return { createOneRecord: mockCreatePerson };
      case 'corporateEvent':
        return { createOneRecord: mockCreateCorporateEvent };
      case 'eventProposal':
        return { createOneRecord: mockCreateEventProposal };
      case 'eventCatalog':
        return { createOneRecord: mockCreateEventCatalog };
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

jest.mock('@/object-record/hooks/useUpdateOneRecord', () => ({
  useUpdateOneRecord: () => ({ updateOneRecord: mockUpdateOneRecord }),
}));

let companyRecords: unknown[] = [];
let isLoadingCompany = false;
let eventCatalogRecords: unknown[] = [];
let isLoadingEventCatalog = false;

jest.mock('@/object-record/hooks/useFindManyRecords', () => ({
  useFindManyRecords: ({
    objectNameSingular,
  }: {
    objectNameSingular: string;
  }) =>
    objectNameSingular === 'eventCatalog'
      ? { records: eventCatalogRecords, loading: isLoadingEventCatalog }
      : { records: companyRecords, loading: isLoadingCompany },
}));

// GSH-specific: corporateEvent and eventProposal are custom objects
// registered by the gsh-events app (see ADR-0001), so they aren't part of
// the standard-objects metadata mock. The create gate modal needs them
// resolvable to render past its readiness guard.
const FAKE_CORPORATE_EVENT_METADATA_ITEM: EnrichedObjectMetadataItem = {
  ...getTestEnrichedObjectMetadataItemsMock()[0],
  id: 'corporate-event-metadata-id',
  nameSingular: 'corporateEvent',
  namePlural: 'corporateEvents',
  fields: [],
};

const FAKE_EVENT_PROPOSAL_METADATA_ITEM: EnrichedObjectMetadataItem = {
  ...getTestEnrichedObjectMetadataItemsMock()[0],
  id: 'event-proposal-metadata-id',
  nameSingular: 'eventProposal',
  namePlural: 'eventProposals',
  fields: [],
};

const FAKE_EVENT_CATALOG_METADATA_ITEM: EnrichedObjectMetadataItem = {
  ...getTestEnrichedObjectMetadataItemsMock()[0],
  id: 'event-catalog-metadata-id',
  nameSingular: 'eventCatalog',
  namePlural: 'eventCatalogs',
  fields: [],
};

const PICKED_RECORD_ID_BY_TEST_ID: Record<string, string> = {
  'opportunity-create-gate-modal-company': 'company-1',
  'opportunity-create-gate-modal-person': 'person-1',
  'opportunity-create-gate-modal-event-catalog': 'event-catalog-1',
};

jest.mock(
  '@/object-record/record-field/ui/form-types/components/FormSingleRecordPicker',
  () => ({
    FormSingleRecordPicker: ({
      onChange,
      onCreate,
      testId,
    }: {
      onChange: (value: string) => void;
      onCreate?: (searchInput?: string) => void | Promise<void>;
      testId: string;
    }) => (
      <div>
        <button
          data-testid={testId}
          onClick={() => onChange(PICKED_RECORD_ID_BY_TEST_ID[testId])}
        >
          pick record
        </button>
        <button
          data-testid={`${testId}-create`}
          onClick={() => onCreate?.('Novo item')}
        >
          create record
        </button>
      </div>
    ),
  }),
);

// Mirrors Select.tsx's own selectedOption fallback (matching option, else
// emptyOption, else options[0]) so tests can catch a regression of the bug
// fixed in #70: a required Select rendering its first option as if chosen
// while the field's own value is still empty.
jest.mock('@/ui/input/components/Select', () => ({
  Select: ({
    dropdownId,
    value,
    options,
    emptyOption,
    onChange,
  }: {
    dropdownId: string;
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
      <div>
        <span data-testid={`${dropdownId}-selected-label`}>
          {selectedOption?.label}
        </span>
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
      </div>
    );
  },
}));

jest.mock(
  '@/object-record/record-persistence-gate/components/fields/GateFieldWrapper',
  () => ({
    GateFieldWrapper: ({ children }: { children: ReactNode }) => children,
  }),
);

jest.mock(
  '@/object-record/record-persistence-gate/components/GateRequirementSummary',
  () => ({
    GateRequirementSummary: () => null,
  }),
);

const Wrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: [],
  objectMetadataItems: [
    ...getTestEnrichedObjectMetadataItemsMock(),
    FAKE_CORPORATE_EVENT_METADATA_ITEM,
    FAKE_EVENT_PROPOSAL_METADATA_ITEM,
    FAKE_EVENT_CATALOG_METADATA_ITEM,
  ],
});

// eventCatalog (#67/#68) may not be applied to a given workspace's schema
// yet even though this modal's code is deployed — the base modal must keep
// working regardless, only without the Modalidade Interna picker.
const WrapperWithoutEventCatalog = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: [],
  objectMetadataItems: [
    ...getTestEnrichedObjectMetadataItemsMock(),
    FAKE_CORPORATE_EVENT_METADATA_ITEM,
    FAKE_EVENT_PROPOSAL_METADATA_ITEM,
  ],
});

const fillRequiredFields = () => {
  fireEvent.change(
    screen.getByTestId('opportunity-create-gate-modal-modality'),
    { target: { value: 'EXTERNAL' } },
  );
  fireEvent.change(screen.getByLabelText('Nome do evento'), {
    target: { value: 'Confraternização de fim de ano' },
  });
  fireEvent.click(screen.getByTestId('opportunity-create-gate-modal-company'));
  fireEvent.change(screen.getByLabelText('Data de início do evento'), {
    target: { value: '2026-09-10T14:30' },
  });
  fireEvent.change(screen.getByTestId('opportunity-create-gate-modal-source'), {
    target: { value: 'WHATSAPP' },
  });
};

describe('OpportunityCreateGateModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    companyRecords = [];
    isLoadingCompany = false;
    eventCatalogRecords = [];
    isLoadingEventCatalog = false;
    jotaiStore.set(currentWorkspaceMemberState.atom, {
      id: 'workspace-member-1',
    } as never);
    mockCreateOpportunity.mockResolvedValue({ id: 'opportunity-1' });
    mockCreateCompany.mockResolvedValue({ id: 'company-1' });
    mockCreatePerson.mockResolvedValue({ id: 'person-1' });
    mockCreateCorporateEvent.mockResolvedValue({ id: 'event-1' });
    mockCreateEventProposal.mockResolvedValue({ id: 'proposal-1' });
    mockCreateEventCatalog.mockResolvedValue({ id: 'event-catalog-1' });
    mockCreateTask.mockResolvedValue({ id: 'task-1' });
    mockCreateTaskTarget.mockResolvedValue({ id: 'task-target-1' });
    mockUpdateOneRecord.mockResolvedValue({ id: 'company-1' });
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
        pointOfContactId: null,
        eventModality: 'EXTERNAL',
        eventAt: new Date('2026-09-10T14:30').toISOString(),
        eventSource: 'WHATSAPP',
        ownerId: 'workspace-member-1',
      }),
    );
    expect(mockCreateOpportunity.mock.calls[0][0]).not.toHaveProperty(
      'eventCatalogId',
    );

    expect(mockCreateTask).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Enviar contato inicial',
        status: 'TODO',
        assigneeId: 'workspace-member-1',
      }),
    );

    expect(mockCreateTaskTarget).toHaveBeenCalledWith({
      taskId: 'task-1',
      targetOpportunityId: 'opportunity-1',
    });

    const createdTaskDueAt = mockCreateTask.mock.calls[0][0].dueAt;

    expect(mockUpdateOneRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        objectNameSingular: CoreObjectNameSingular.Opportunity,
        idToUpdate: 'opportunity-1',
        updateOneRecordInput: {
          eventNextAction: 'Enviar contato inicial',
          eventNextActionAt: createdTaskDueAt,
        },
      }),
    );
  });

  it('includes the picked contact as the point of contact when one is selected', async () => {
    render(<OpportunityCreateGateModal />, { wrapper: Wrapper });

    const handler = jotaiStore.get(opportunityCreateGateHandlerState);
    act(() => {
      handler?.({ recordInput: {} });
    });

    fillRequiredFields();
    fireEvent.click(screen.getByTestId('opportunity-create-gate-modal-person'));

    await act(async () => {
      fireEvent.click(screen.getByText('Criar'));
    });

    expect(mockCreateOpportunity).toHaveBeenCalledWith(
      expect.objectContaining({ pointOfContactId: 'person-1' }),
    );
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

  it('shows a neutral placeholder, not the first option, for the required selects before the user picks anything', () => {
    render(<OpportunityCreateGateModal />, { wrapper: Wrapper });

    const handler = jotaiStore.get(opportunityCreateGateHandlerState);
    act(() => {
      handler?.({ recordInput: { eventProcessStage: 'PROPOSAL_NEGOTIATION' } });
    });

    const modalityLabel = screen.getByTestId(
      'opportunity-create-gate-modal-modality-selected-label',
    );
    const sourceLabel = screen.getByTestId(
      'opportunity-create-gate-modal-source-selected-label',
    );
    const eventTypeLabel = screen.getByTestId(
      'opportunity-create-gate-modal-event-type-selected-label',
    );

    expect(modalityLabel).not.toHaveTextContent('Interno / na casa');
    expect(sourceLabel).not.toHaveTextContent('E-mail');
    expect(eventTypeLabel).not.toHaveTextContent('Coffee break');
    expect(modalityLabel).toHaveTextContent('Selecionar...');
    expect(sourceLabel).toHaveTextContent('Selecionar...');
    expect(eventTypeLabel).toHaveTextContent('Selecionar...');
  });

  describe('the event-identity field for Modalidade', () => {
    it('disables the free-text event name field with a placeholder until a modality is picked', () => {
      render(<OpportunityCreateGateModal />, { wrapper: Wrapper });

      const handler = jotaiStore.get(opportunityCreateGateHandlerState);
      act(() => {
        handler?.({ recordInput: {} });
      });

      const nameField = screen.getByLabelText(
        'Nome do evento',
      ) as HTMLInputElement;

      expect(nameField).toBeDisabled();
      expect(nameField.placeholder).toBe('Escolha a modalidade primeiro');
    });

    it('keeps the free-text event name field for Modalidade Externa', () => {
      render(<OpportunityCreateGateModal />, { wrapper: Wrapper });

      const handler = jotaiStore.get(opportunityCreateGateHandlerState);
      act(() => {
        handler?.({ recordInput: {} });
      });

      fireEvent.change(
        screen.getByTestId('opportunity-create-gate-modal-modality'),
        { target: { value: 'EXTERNAL' } },
      );

      expect(screen.getByLabelText('Nome do evento')).toBeEnabled();
      expect(
        screen.queryByTestId('opportunity-create-gate-modal-event-catalog'),
      ).not.toBeInTheDocument();
    });

    it('switches to the eventCatalog picker for Modalidade Interna, and uses the picked record as the opportunity name and eventCatalogId', async () => {
      eventCatalogRecords = [
        {
          id: 'event-catalog-1',
          name: 'Jogo Nubank',
          venueGroup: 'Nubank Arena',
        },
      ];

      render(<OpportunityCreateGateModal />, { wrapper: Wrapper });

      const handler = jotaiStore.get(opportunityCreateGateHandlerState);
      act(() => {
        handler?.({ recordInput: {} });
      });

      fireEvent.change(
        screen.getByTestId('opportunity-create-gate-modal-modality'),
        { target: { value: 'INTERNAL' } },
      );

      expect(screen.queryByLabelText('Nome do evento')).not.toBeInTheDocument();

      fireEvent.change(
        screen.getByTestId('opportunity-create-gate-modal-venue'),
        { target: { value: 'Nubank Arena' } },
      );

      fireEvent.click(
        screen.getByTestId('opportunity-create-gate-modal-event-catalog'),
      );
      fireEvent.click(
        screen.getByTestId('opportunity-create-gate-modal-company'),
      );
      fireEvent.change(screen.getByLabelText('Data de início do evento'), {
        target: { value: '2026-09-10T14:30' },
      });
      fireEvent.change(
        screen.getByTestId('opportunity-create-gate-modal-source'),
        { target: { value: 'WHATSAPP' } },
      );

      await act(async () => {
        fireEvent.click(screen.getByText('Criar'));
      });

      expect(mockCreateOpportunity).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Jogo Nubank',
          eventCatalogId: 'event-catalog-1',
          eventModality: 'INTERNAL',
        }),
      );
    });

    it('creates a new eventCatalog record inline and selects it, mirroring the Empresa/Contato pattern', async () => {
      eventCatalogRecords = [
        {
          id: 'event-catalog-1',
          name: 'Jogo Nubank',
          venueGroup: 'Nubank Arena',
        },
      ];

      render(<OpportunityCreateGateModal />, { wrapper: Wrapper });

      const handler = jotaiStore.get(opportunityCreateGateHandlerState);
      act(() => {
        handler?.({ recordInput: {} });
      });

      fireEvent.change(
        screen.getByTestId('opportunity-create-gate-modal-modality'),
        { target: { value: 'INTERNAL' } },
      );

      fireEvent.change(
        screen.getByTestId('opportunity-create-gate-modal-venue'),
        { target: { value: 'Nubank Arena' } },
      );

      await act(async () => {
        fireEvent.click(
          screen.getByTestId(
            'opportunity-create-gate-modal-event-catalog-create',
          ),
        );
      });

      expect(mockCreateEventCatalog).toHaveBeenCalled();
    });

    it('hides the Venue field for Modalidade Externa and before any modality is picked', () => {
      render(<OpportunityCreateGateModal />, { wrapper: Wrapper });

      const handler = jotaiStore.get(opportunityCreateGateHandlerState);
      act(() => {
        handler?.({ recordInput: {} });
      });

      expect(
        screen.queryByTestId('opportunity-create-gate-modal-venue'),
      ).not.toBeInTheDocument();

      fireEvent.change(
        screen.getByTestId('opportunity-create-gate-modal-modality'),
        { target: { value: 'EXTERNAL' } },
      );

      expect(
        screen.queryByTestId('opportunity-create-gate-modal-venue'),
      ).not.toBeInTheDocument();
    });

    it('offers the distinct venueGroup values across eventCatalog records as Venue options, and keeps Evento hidden until a venue is picked', () => {
      eventCatalogRecords = [
        {
          id: 'event-catalog-1',
          name: 'Jogo Nubank',
          venueGroup: 'Nubank Arena',
        },
        {
          id: 'event-catalog-2',
          name: 'Jogo Morumbis',
          venueGroup: 'Morumbis',
        },
        {
          id: 'event-catalog-3',
          name: 'Outro jogo Nubank',
          venueGroup: 'Nubank Arena',
        },
        {
          id: 'event-catalog-4',
          name: 'Sem venue cadastrado',
          venueGroup: null,
        },
      ];

      render(<OpportunityCreateGateModal />, { wrapper: Wrapper });

      const handler = jotaiStore.get(opportunityCreateGateHandlerState);
      act(() => {
        handler?.({ recordInput: {} });
      });

      fireEvent.change(
        screen.getByTestId('opportunity-create-gate-modal-modality'),
        { target: { value: 'INTERNAL' } },
      );

      const venueSelect = screen.getByTestId(
        'opportunity-create-gate-modal-venue',
      ) as HTMLSelectElement;
      const venueOptionValues = Array.from(venueSelect.options).map(
        (option) => option.value,
      );

      expect(venueOptionValues).toEqual(['', 'Morumbis', 'Nubank Arena']);
      expect(
        screen.queryByTestId('opportunity-create-gate-modal-event-catalog'),
      ).not.toBeInTheDocument();

      fireEvent.change(venueSelect, { target: { value: 'Nubank Arena' } });

      expect(
        screen.getByTestId('opportunity-create-gate-modal-event-catalog'),
      ).toBeInTheDocument();
    });

    it('blocks creation until a Venue is picked for Modalidade Interna, even once Evento and the other base fields are filled', async () => {
      eventCatalogRecords = [
        {
          id: 'event-catalog-1',
          name: 'Jogo Nubank',
          venueGroup: 'Nubank Arena',
        },
      ];

      render(<OpportunityCreateGateModal />, { wrapper: Wrapper });

      const handler = jotaiStore.get(opportunityCreateGateHandlerState);
      act(() => {
        handler?.({ recordInput: {} });
      });

      fireEvent.change(
        screen.getByTestId('opportunity-create-gate-modal-modality'),
        { target: { value: 'INTERNAL' } },
      );
      fireEvent.click(
        screen.getByTestId('opportunity-create-gate-modal-company'),
      );
      fireEvent.change(screen.getByLabelText('Data de início do evento'), {
        target: { value: '2026-09-10T14:30' },
      });
      fireEvent.change(
        screen.getByTestId('opportunity-create-gate-modal-source'),
        { target: { value: 'WHATSAPP' } },
      );

      await act(async () => {
        fireEvent.click(screen.getByText('Criar'));
      });

      expect(mockCreateOpportunity).not.toHaveBeenCalled();

      fireEvent.change(
        screen.getByTestId('opportunity-create-gate-modal-venue'),
        { target: { value: 'Nubank Arena' } },
      );
      fireEvent.click(
        screen.getByTestId('opportunity-create-gate-modal-event-catalog'),
      );

      await act(async () => {
        fireEvent.click(screen.getByText('Criar'));
      });

      expect(mockCreateOpportunity).toHaveBeenCalledWith(
        expect.objectContaining({ eventCatalogId: 'event-catalog-1' }),
      );
    });

    it('still renders and creates opportunities when eventCatalog is not yet on the workspace schema, without offering Modalidade Interna', async () => {
      render(<OpportunityCreateGateModal />, {
        wrapper: WrapperWithoutEventCatalog,
      });

      const handler = jotaiStore.get(opportunityCreateGateHandlerState);
      act(() => {
        handler?.({ recordInput: {} });
      });

      expect(
        screen.getByTestId(
          'opportunity-create-gate-modal-modality-selected-label',
        ),
      ).not.toHaveTextContent('Interno / na casa');

      fillRequiredFields();

      await act(async () => {
        fireEvent.click(screen.getByText('Criar'));
      });

      expect(mockCreateOpportunity).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Confraternização de fim de ano',
          eventModality: 'EXTERNAL',
        }),
      );
    });
  });

  describe('cumulative fields when created directly in an advanced column', () => {
    const originalPointerEvent = window.PointerEvent;

    beforeAll(() => {
      Object.defineProperty(window, 'PointerEvent', {
        configurable: true,
        value: MouseEvent,
      });
    });

    afterAll(() => {
      Object.defineProperty(window, 'PointerEvent', {
        configurable: true,
        value: originalPointerEvent,
      });
    });

    const fillQualificationFields = () => {
      fireEvent.change(
        screen.getByTestId('opportunity-create-gate-modal-event-type'),
        { target: { value: 'COFFEE_BREAK' } },
      );
      fireEvent.change(screen.getByLabelText('Público estimado'), {
        target: { value: '80' },
      });
      fireEvent.change(screen.getByLabelText('Local'), {
        target: { value: 'Casa GSH' },
      });
      fireEvent.change(screen.getByLabelText('Cidade'), {
        target: { value: 'São Paulo' },
      });
      fireEvent.click(screen.getByTestId('input-checkbox'));
    };

    const getCreateButton = () =>
      screen.getByText('Criar').closest('button') as HTMLButtonElement;

    const fillAcceptanceFields = () => {
      fireEvent.change(screen.getByLabelText('Valor fechado (R$)'), {
        target: { value: '4500' },
      });
      fireEvent.change(screen.getByLabelText('Evidência do aceite'), {
        target: { value: 'https://mail.example.com/aceite-cliente' },
      });
    };

    it('does not ask for any extra field when created in the entry stage', () => {
      render(<OpportunityCreateGateModal />, { wrapper: Wrapper });

      const handler = jotaiStore.get(opportunityCreateGateHandlerState);
      act(() => {
        handler?.({ recordInput: { eventProcessStage: 'ENTRY' } });
      });

      expect(
        screen.queryByTestId('opportunity-create-gate-modal-event-type'),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByLabelText('Valor fechado (R$)'),
      ).not.toBeInTheDocument();
      expect(screen.queryByText('Qualificação')).not.toBeInTheDocument();
      expect(screen.queryByText('Aceite e cadastro')).not.toBeInTheDocument();
      expect(screen.queryByText('Dados fiscais')).not.toBeInTheDocument();
    });

    it('requires the qualification-gate fields, creates the corporate event, and skips the retroactive task when created in Proposta e negociação', async () => {
      render(<OpportunityCreateGateModal />, { wrapper: Wrapper });

      const handler = jotaiStore.get(opportunityCreateGateHandlerState);
      act(() => {
        handler?.({
          recordInput: { eventProcessStage: 'PROPOSAL_NEGOTIATION' },
        });
      });

      fillRequiredFields();

      expect(getCreateButton()).toBeDisabled();

      fillQualificationFields();

      expect(getCreateButton()).not.toBeDisabled();

      await act(async () => {
        fireEvent.click(screen.getByText('Criar'));
      });

      expect(mockCreateOpportunity).toHaveBeenCalledWith(
        expect.objectContaining({
          eventProcessStage: 'PROPOSAL_NEGOTIATION',
          eventAudience: 80,
          eventLocation: 'Casa GSH',
        }),
      );

      expect(mockCreateCorporateEvent).toHaveBeenCalledWith({
        name: 'Confraternização de fim de ano',
        eventType: 'COFFEE_BREAK',
        city: 'São Paulo',
        estimatedAudience: 80,
        startAt: new Date('2026-09-10T14:30').toISOString(),
        endAt: null,
        opportunityId: 'opportunity-1',
      });

      expect(mockCreateEventProposal).not.toHaveBeenCalled();

      expect(mockCreateTask).toHaveBeenCalledTimes(1);
      expect(mockCreateTask).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Enviar contato inicial',
        }),
      );
    });

    it('groups the cumulative fields under a section heading per skipped gate, in funnel-stage order', () => {
      companyRecords = [
        {
          id: 'company-1',
          legalName: null,
          taxId: null,
          billingEmail: null,
        },
      ];

      render(<OpportunityCreateGateModal />, { wrapper: Wrapper });

      const handler = jotaiStore.get(opportunityCreateGateHandlerState);
      act(() => {
        handler?.({
          recordInput: { eventProcessStage: 'PRODUCTION_FORMALIZATION_EVENT' },
        });
      });

      fireEvent.click(
        screen.getByTestId('opportunity-create-gate-modal-company'),
      );

      const headings = [
        'Qualificação',
        'Aceite e cadastro',
        'Dados fiscais',
      ].map((label) => screen.getByText(label));

      expect(headings[0].compareDocumentPosition(headings[1])).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING,
      );
      expect(headings[1].compareDocumentPosition(headings[2])).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING,
      );
    });

    it('requires the qualification and acceptance gate fields cumulatively when created in Aceite e cadastro', async () => {
      render(<OpportunityCreateGateModal />, { wrapper: Wrapper });

      const handler = jotaiStore.get(opportunityCreateGateHandlerState);
      act(() => {
        handler?.({
          recordInput: { eventProcessStage: 'ACCEPTANCE_REGISTRATION' },
        });
      });

      fillRequiredFields();
      fillQualificationFields();

      expect(getCreateButton()).toBeDisabled();

      fillAcceptanceFields();

      expect(getCreateButton()).not.toBeDisabled();

      await act(async () => {
        fireEvent.click(screen.getByText('Criar'));
      });

      expect(mockCreateOpportunity).toHaveBeenCalledWith(
        expect.objectContaining({
          eventProcessStage: 'ACCEPTANCE_REGISTRATION',
          eventAudience: 80,
          eventLocation: 'Casa GSH',
          eventClosedAmount: {
            amountMicros: 4_500_000_000,
            currencyCode: 'BRL',
          },
          eventAcceptanceEvidence: 'https://mail.example.com/aceite-cliente',
        }),
      );

      expect(mockCreateEventProposal).toHaveBeenCalledWith({
        name: 'Confraternização de fim de ano',
        version: 1,
        status: 'ACCEPTED',
        total: { amountMicros: 4_500_000_000, currencyCode: 'BRL' },
        opportunityId: 'opportunity-1',
      });

      expect(mockCreateTask).toHaveBeenCalledTimes(1);
      expect(mockCreateTask).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Enviar contato inicial',
        }),
      );
    });

    it('only asks for the fiscal fields missing on the company, and writes them to Company, when created in Produção/formalização', async () => {
      companyRecords = [
        {
          id: 'company-1',
          legalName: null,
          taxId: '12.345.678/0001-90',
          billingEmail: 'faturamento@cliente.com',
        },
      ];

      render(<OpportunityCreateGateModal />, { wrapper: Wrapper });

      const handler = jotaiStore.get(opportunityCreateGateHandlerState);
      act(() => {
        handler?.({
          recordInput: { eventProcessStage: 'PRODUCTION_FORMALIZATION_EVENT' },
        });
      });

      fillRequiredFields();
      fillQualificationFields();
      fillAcceptanceFields();

      expect(screen.getByLabelText('Razão social')).toBeInTheDocument();
      expect(screen.queryByLabelText('CNPJ')).not.toBeInTheDocument();
      expect(
        screen.queryByLabelText('E-mail de faturamento'),
      ).not.toBeInTheDocument();
      expect(screen.getByText('Dados fiscais')).toBeInTheDocument();
      expect(getCreateButton()).toBeDisabled();

      fireEvent.change(screen.getByLabelText('Razão social'), {
        target: { value: 'Gourmet e Companhia LTDA' },
      });

      expect(getCreateButton()).not.toBeDisabled();

      await act(async () => {
        fireEvent.click(screen.getByText('Criar'));
      });

      expect(mockUpdateOneRecord).toHaveBeenCalledWith({
        objectNameSingular: CoreObjectNameSingular.Company,
        idToUpdate: 'company-1',
        updateOneRecordInput: { legalName: 'Gourmet e Companhia LTDA' },
      });

      expect(mockCreateEventProposal).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'ACCEPTED' }),
      );

      expect(mockCreateTask).toHaveBeenCalledTimes(1);
      expect(mockCreateTask).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Enviar contato inicial',
        }),
      );
    });
  });
});
