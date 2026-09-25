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
const mockGetPlaceDetailsData = jest.fn();
let opportunityModality = 'EXTERNAL';
let opportunityLocation: string | undefined;
let opportunityEventAt: string | undefined;
let opportunityEventEndAt: string | undefined;
let corporateEventCity: string | undefined;
let corporateEventStartAt: string | undefined;
let corporateEventEndAt: string | undefined;
let placeAutocompleteData: { text: string; placeId: string }[] = [];
const translatedMessages: Record<string, string> = {
  HN6ic2: 'Tipo de evento',
  tbO7pJ: 'Público estimado',
  d5zxa4: 'Local',
  'W+HvlL': 'Cidade',
  '/gwQhm': 'Data do evento',
  ytcDq7: 'Cancelar',
  'hY+loZ': 'Avançar',
  vyUD5d: 'Montar e enviar proposta',
  U0A1k5: 'Selecionar...',
  '9OrMf2': 'Cidade: Campinas',
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
              eventModality: opportunityModality,
              eventLocation: opportunityLocation,
              eventAt: opportunityEventAt,
              eventEndAt: opportunityEventEndAt,
            },
          ],
          loading: false,
        }
      : {
          records:
            corporateEventCity || corporateEventStartAt || corporateEventEndAt
              ? [
                  {
                    id: 'event-1',
                    city: corporateEventCity,
                    startAt: corporateEventStartAt,
                    endAt: corporateEventEndAt,
                  },
                ]
              : [],
          loading: false,
        },
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
    disabled,
  }: {
    dropdownId: string;
    label: string;
    value: string;
    options: { value: string; label: string }[];
    emptyOption?: { value: string; label: string };
    onChange: (value: string) => void;
    disabled?: boolean;
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
            disabled={disabled}
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

jest.mock('@/ui/input/components/SettingsTextInput', () => ({
  SettingsTextInput: ({
    instanceId,
    label,
    value,
    onChange,
    type,
  }: {
    instanceId: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
  }) => (
    <label>
      {label}
      <input
        data-testid={instanceId}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  ),
}));

jest.mock('@/geo-map/hooks/usePlaceAutocomplete', () => ({
  usePlaceAutocomplete: () => ({
    placeAutocompleteData,
    tokenForPlaceApi: 'place-token',
    getAutocompletePlaceData: jest.fn(),
    closePlaceAutocomplete: jest.fn(),
    resetPlaceAutocomplete: jest.fn(),
  }),
}));

jest.mock('@/geo-map/hooks/useGetPlaceApiData', () => ({
  useGetPlaceApiData: () => ({
    getPlaceDetailsData: mockGetPlaceDetailsData,
  }),
}));

jest.mock('@/geo-map/components/PlaceAutocompleteSelect', () => ({
  PlaceAutocompleteSelect: ({
    list,
    onChange,
  }: {
    list: { text: string; placeId: string }[];
    onChange: (placeId: string) => void;
  }) => (
    <div>
      {list.map((place) => (
        <button key={place.placeId} onClick={() => onChange(place.placeId)}>
          {place.text}
        </button>
      ))}
    </div>
  ),
}));

jest.mock('@/ui/layout/dropdown/components/Dropdown', () => ({
  Dropdown: ({
    clickableComponent,
    dropdownComponents,
  }: {
    clickableComponent: ReactNode;
    dropdownComponents: ReactNode;
  }) => (
    <div>
      {clickableComponent}
      {dropdownComponents}
    </div>
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
};

describe('OpportunityQualificationGateModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    opportunityModality = 'EXTERNAL';
    opportunityLocation = undefined;
    opportunityEventAt = undefined;
    opportunityEventEndAt = undefined;
    corporateEventCity = undefined;
    corporateEventStartAt = undefined;
    corporateEventEndAt = undefined;
    placeAutocompleteData = [];
    mockGetPlaceDetailsData.mockResolvedValue(undefined);
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

  it('shows a neutral placeholder, not the first option, before an event type is selected', () => {
    render(<OpportunityQualificationGateModal />, { wrapper: Wrapper });
    openGate();

    const eventTypeLabel = screen.getByTestId(
      'opportunity-qualification-gate-modal-event-type-selected-label',
    );

    expect(eventTypeLabel).not.toHaveTextContent('Coffee break');
    expect(eventTypeLabel).toHaveTextContent('Selecionar...');
  });

  it('shows the modality filled earlier without allowing it to be changed', () => {
    render(<OpportunityQualificationGateModal />, { wrapper: Wrapper });
    openGate();

    const modalityField = screen.getByTestId(
      'opportunity-qualification-gate-modal-modality',
    );

    expect(modalityField).toHaveValue('EXTERNAL');
    expect(modalityField).toBeDisabled();
  });

  it('inherits the event start and end dates when a linked event already exists', () => {
    corporateEventStartAt = '2026-09-10T14:00:00.000Z';
    corporateEventEndAt = '2026-09-10T18:00:00.000Z';
    opportunityEventAt = '2026-09-11T14:00:00.000Z';
    opportunityEventEndAt = '2026-09-11T18:00:00.000Z';

    render(<OpportunityQualificationGateModal />, { wrapper: Wrapper });
    openGate();

    expect(
      screen.getByTestId('opportunity-qualification-gate-modal-event-at'),
    ).toHaveValue('2026-09-10T14:00');
    expect(
      screen.getByTestId('opportunity-qualification-gate-modal-event-end-at'),
    ).toHaveValue('2026-09-10T18:00');
  });

  it('uses place autocomplete to persist an external address and its city', async () => {
    placeAutocompleteData = [
      { placeId: 'place-1', text: 'Av. Paulista, 1000, São Paulo' },
    ];
    mockGetPlaceDetailsData.mockResolvedValue({ city: 'São Paulo' });
    const user = userEvent.setup();
    render(<OpportunityQualificationGateModal />, { wrapper: Wrapper });
    openGate();

    await user.type(screen.getByLabelText('Local'), 'Av. Paulista');
    await user.click(screen.getByText('Av. Paulista, 1000, São Paulo'));

    expect(mockGetPlaceDetailsData).toHaveBeenCalledWith(
      'place-1',
      'place-token',
    );
    expect(screen.getByLabelText('Local')).toHaveValue(
      'Av. Paulista, 1000, São Paulo',
    );
    expect(screen.getByLabelText('Cidade')).toHaveValue('São Paulo');

    await user.selectOptions(screen.getByLabelText('Tipo de evento'), [
      'COFFEE_BREAK',
    ]);
    await user.type(screen.getByLabelText('Público estimado'), '80');
    await user.type(
      screen.getByLabelText('Data do evento'),
      '2026-09-10T14:00',
    );
    await user.click(screen.getByText('Avançar'));

    expect(mockCreateCorporateEvent).toHaveBeenCalledWith(
      expect.objectContaining({ city: 'São Paulo' }),
    );
    expect(mockUpdateOneRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        updateOneRecordInput: expect.objectContaining({
          eventLocation: 'Av. Paulista, 1000, São Paulo',
        }),
      }),
    );
  });

  it('requires an arena instead of showing external address fields for internal events', async () => {
    opportunityModality = 'INTERNAL';
    const user = userEvent.setup();
    render(<OpportunityQualificationGateModal />, { wrapper: Wrapper });
    openGate();

    expect(screen.queryByLabelText('Local')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Cidade')).not.toBeInTheDocument();

    expect(
      [
        ...(
          screen.getByTestId(
            'opportunity-qualification-gate-modal-arena',
          ) as HTMLSelectElement
        ).options,
      ].map((option) => option.value),
    ).toEqual(['', 'Nubank', 'Morumbis']);

    await user.selectOptions(
      screen.getByTestId('opportunity-qualification-gate-modal-arena'),
      ['Nubank'],
    );
    await user.selectOptions(screen.getByLabelText('Tipo de evento'), [
      'COFFEE_BREAK',
    ]);
    await user.type(screen.getByLabelText('Público estimado'), '80');
    await user.type(
      screen.getByLabelText('Data do evento'),
      '2026-09-10T14:00',
    );

    await user.click(screen.getByText('Avançar'));

    expect(mockCreateCorporateEvent).toHaveBeenCalledWith(
      expect.objectContaining({ city: 'São Paulo' }),
    );
    expect(mockUpdateOneRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        updateOneRecordInput: expect.objectContaining({
          eventLocation: 'Nubank',
        }),
      }),
    );
  });

  it('keeps a legacy internal location readable in the arena selector', () => {
    opportunityModality = 'INTERNAL';
    opportunityLocation = 'Espaço legado';
    corporateEventCity = 'Campinas';
    render(<OpportunityQualificationGateModal />, { wrapper: Wrapper });
    openGate();

    expect(
      screen.getByTestId(
        'opportunity-qualification-gate-modal-arena-selected-label',
      ),
    ).toHaveTextContent('Espaço legado');
    expect(screen.getByText('Cidade: Campinas')).toBeInTheDocument();
  });

  it.each([
    ['EXTERNAL', 'external'],
    ['INTERNAL', 'internal'],
  ])(
    'does not advance an %s opportunity without its required location',
    async (modality) => {
      opportunityModality = modality;
      const user = userEvent.setup();
      render(<OpportunityQualificationGateModal />, { wrapper: Wrapper });
      openGate();

      await user.selectOptions(screen.getByLabelText('Tipo de evento'), [
        'COFFEE_BREAK',
      ]);
      await user.type(screen.getByLabelText('Público estimado'), '80');
      if (modality === 'EXTERNAL') {
        await user.type(screen.getByLabelText('Cidade'), 'São Paulo');
      }
      await user.type(
        screen.getByLabelText('Data do evento'),
        '2026-09-10T14:00',
      );

      expect(screen.getByText('Avançar')).toBeDisabled();
    },
  );

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
