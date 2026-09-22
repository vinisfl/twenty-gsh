import { useCallback, useEffect, useState } from 'react';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useLingui } from '@lingui/react/macro';
import { useAtomValue, useSetAtom } from 'jotai';
import { styled } from '@linaria/react';
import { Temporal } from 'temporal-polyfill';
import { v4 } from 'uuid';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Button, Checkbox } from 'twenty-ui/input';
import { Section, SectionAlignment, SectionFontColor } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { H1Title, H1TitleFontColor } from 'twenty-ui/typography';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { PreComputedChipGeneratorsProvider } from '@/object-metadata/components/PreComputedChipGeneratorsProvider';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { GateRequirementSummary } from '@/object-record/record-persistence-gate/components/GateRequirementSummary';
import { GateFieldWrapper } from '@/object-record/record-persistence-gate/components/fields/GateFieldWrapper';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { buildRecordLabelPayload } from '@/object-record/utils/buildRecordLabelPayload';
import { GSH_EVENT_FUNNEL_CORPORATE_EVENT } from '@/object-record/record-persistence-gate/constants/GshEventFunnelCorporateEvent';
import { GSH_EVENT_INITIAL_CONTACT_TASK_TITLE } from '@/object-record/record-persistence-gate/constants/GshEventInitialContactTaskTitle';
import { GSH_EVENT_MODALITY_INTERNAL_VALUE } from '@/object-record/record-persistence-gate/constants/GshEventModalityInternalValue';
import { GSH_EVENT_MODALITY_OPTIONS } from '@/object-record/record-persistence-gate/constants/GshEventModalityOptions';
import { GSH_EVENT_SOURCE_OPTIONS } from '@/object-record/record-persistence-gate/constants/GshEventSourceOptions';
import { GSH_EVENT_TYPE_OPTIONS } from '@/object-record/record-persistence-gate/constants/GshEventTypeOptions';
import { OPPORTUNITY_CREATE_GATE_MODAL_ID } from '@/object-record/record-persistence-gate/constants/OpportunityCreateGateModalId';
import { useEventCatalogVenueGroupOptions } from '@/object-record/record-persistence-gate/hooks/useEventCatalogVenueGroupOptions';
import { opportunityCreateGateHandlerState } from '@/object-record/record-persistence-gate/states/opportunityCreateGateHandlerState';
import { opportunityCreateGatePendingRequestState } from '@/object-record/record-persistence-gate/states/opportunityCreateGatePendingRequestState';
import { fromDateTimeLocalInputValue } from '@/object-record/record-persistence-gate/utils/fromDateTimeLocalInputValue';
import { getNextBusinessDayIso } from '@/object-record/record-persistence-gate/utils/getNextBusinessDayIso';
import { getOpportunityCreateCumulativeGateFlags } from '@/object-record/record-persistence-gate/utils/getOpportunityCreateCumulativeGateFlags';
import { getGateFieldStatus } from '@/object-record/record-persistence-gate/utils/getGateFieldStatus';
import { type GateFieldStatus } from '@/object-record/record-persistence-gate/types/GateFieldStatus';
import { isFilled } from '@/object-record/record-persistence-gate/utils/isFilled';
import { toDateTimeLocalInputValue } from '@/object-record/record-persistence-gate/utils/toDateTimeLocalInputValue';
import { FormSingleRecordPicker } from '@/object-record/record-field/ui/form-types/components/FormSingleRecordPicker';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { Select } from '@/ui/input/components/Select';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ModalStatefulWrapper } from '@/ui/layout/modal/components/ModalStatefulWrapper';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const StyledCenteredTitle = styled.div`
  text-align: center;
`;

const StyledSectionContainer = styled.div`
  margin-bottom: ${themeCssVariables.spacing[6]};
`;

const StyledFields = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledCheckboxRow = styled.label`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledModalActions = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  margin-top: ${themeCssVariables.spacing[6]};

  > div {
    flex: 1;
  }
`;

const StyledInheritedValue = styled.div`
  color: ${themeCssVariables.font.color.secondary};
`;

const StyledGateSectionTitle = styled.div`
  border-top: 1px solid ${themeCssVariables.border.color.light};
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  padding-top: ${themeCssVariables.spacing[4]};
`;

type CompanyFiscalRecord = ObjectRecord & {
  legalName: string | null;
  taxId: string | null;
  billingEmail: string | null;
};

type EventCatalogRecord = ObjectRecord & {
  name: string;
};

type BaseFieldRequirement = {
  isSatisfied: boolean;
  label: string;
};

// GSH-specific: pairs with the extension points added to
// RecordBoardColumnNewRecordButton, CreateNewIndexRecordNoSelectionRecordCommand
// and useRecordBoardDndKit (see ADR-0001). This component registers the app's
// blocking create handler and renders the modal itself, since the sandboxed
// twenty-sdk app can't reach opportunityCreateGateHandlerState.
//
// Mounted once, always, at the workspace app shell level (WorkspaceAppProviders),
// which sits above the metadata-readiness gate the rest of the routed app relies
// on (MinimalMetadataGate) and outside the <Outlet /> it wraps with
// PreComputedChipGeneratorsProvider (needed to render a picked record as a
// RecordChip). useCreateOneRecord throws if object metadata for its object
// isn't loaded yet, so this outer component defers rendering the part of the
// tree that calls it until the Opportunity object metadata item itself is
// available (checked directly, rather than via isMinimalMetadataReadyState,
// which can report ready before this specific selector has caught up), and
// re-provides PreComputedChipGeneratorsProvider locally since MinimalMetadataGate's
// instance doesn't reach this subtree.
export const OpportunityCreateGateModal = () => {
  const opportunityObjectMetadataItem = useAtomFamilySelectorValue(
    objectMetadataItemFamilySelector,
    {
      objectName: CoreObjectNameSingular.Opportunity,
      objectNameType: 'singular',
    },
  );
  // Needed when creating direct into an advanced column, whose cumulative
  // qualification-gate fields are persisted onto a new corporateEvent record.
  const corporateEventObjectMetadataItem = useAtomFamilySelectorValue(
    objectMetadataItemFamilySelector,
    {
      objectName: 'corporateEvent',
      objectNameType: 'singular',
    },
  );
  // Needed when creating direct into Aceite e cadastro or beyond, whose
  // cumulative acceptance-gate fields require an accepted eventProposal to
  // exist (mirrors OpportunityAcceptanceGateModal's own requirement) so a
  // later regression-then-readvance through that gate doesn't get stuck on
  // "no proposal found".
  const eventProposalObjectMetadataItem = useAtomFamilySelectorValue(
    objectMetadataItemFamilySelector,
    {
      objectName: 'eventProposal',
      objectNameType: 'singular',
    },
  );
  if (
    !isDefined(opportunityObjectMetadataItem) ||
    !isDefined(corporateEventObjectMetadataItem) ||
    !isDefined(eventProposalObjectMetadataItem)
  ) {
    return null;
  }

  return (
    <PreComputedChipGeneratorsProvider>
      <OpportunityCreateGateModalContent />
    </PreComputedChipGeneratorsProvider>
  );
};

type EventCatalogVenueFieldProps = {
  venue: string;
  onVenueChange: (venue: string) => void;
  status: GateFieldStatus;
  dropdownId: string;
};

// Split out for the same reason as EventCatalogIdentityField below: the
// venueGroup options come from an eventCatalog-typed query, which throws if
// eventCatalog isn't on this workspace's schema yet, so this must only
// mount once the caller has confirmed the object exists.
const EventCatalogVenueField = ({
  venue,
  onVenueChange,
  status,
  dropdownId,
}: EventCatalogVenueFieldProps) => {
  const { t } = useLingui();
  const venueOptions = useEventCatalogVenueGroupOptions();

  return (
    <GateFieldWrapper status={status}>
      <Select
        dropdownId={dropdownId}
        label="Venue"
        value={venue}
        options={venueOptions}
        emptyOption={{ label: t`Selecionar...`, value: '' }}
        onChange={onVenueChange}
        isDropdownInModal
        fullWidth
      />
    </GateFieldWrapper>
  );
};

type EventCatalogIdentityFieldProps = {
  eventCatalogId: string | null;
  onEventCatalogIdChange: (eventCatalogId: string | null) => void;
  onRecordChange: (
    record: EventCatalogRecord | undefined,
    isLoading: boolean,
  ) => void;
  status: GateFieldStatus;
  testId: string;
};

// Split out from OpportunityCreateGateModalContent so the eventCatalog-typed
// hooks below (which throw if eventCatalog isn't on this workspace's schema
// yet, same as useCreateOneRecord elsewhere in this file) only run once the
// caller has confirmed the object exists — see isEventCatalogAvailable.
const EventCatalogIdentityField = ({
  eventCatalogId,
  onEventCatalogIdChange,
  onRecordChange,
  status,
  testId,
}: EventCatalogIdentityFieldProps) => {
  const { createOneRecord: createEventCatalog } = useCreateOneRecord({
    objectNameSingular: 'eventCatalog',
  });
  const { objectMetadataItem: eventCatalogObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: 'eventCatalog',
    });
  const { records: eventCatalogs, loading: isLoadingEventCatalog } =
    useFindManyRecords<EventCatalogRecord>({
      objectNameSingular: 'eventCatalog',
      filter: { id: { eq: eventCatalogId ?? '' } },
      limit: 1,
      skip: !isDefined(eventCatalogId),
    });
  const eventCatalog = eventCatalogs[0];

  useEffect(() => {
    onRecordChange(eventCatalog, isLoadingEventCatalog);
  }, [eventCatalog, isLoadingEventCatalog, onRecordChange]);

  const handleCreateEventCatalog = async (searchInput?: string) => {
    const newEventCatalogId = v4();
    const createdEventCatalog = await createEventCatalog(
      buildRecordLabelPayload({
        id: newEventCatalogId,
        searchInput,
        objectMetadataItem: eventCatalogObjectMetadataItem,
      }),
    );

    if (isDefined(createdEventCatalog)) {
      onEventCatalogIdChange(createdEventCatalog.id);
    }
  };

  return (
    <GateFieldWrapper status={status}>
      <FormSingleRecordPicker
        label="Evento"
        defaultValue={eventCatalogId}
        onChange={(value) =>
          onEventCatalogIdChange((value as string | null) ?? null)
        }
        onCreate={handleCreateEventCatalog}
        objectNameSingulars={['eventCatalog']}
        isDropdownInModal
        testId={testId}
      />
    </GateFieldWrapper>
  );
};

const OpportunityCreateGateModalContent = () => {
  const { t } = useLingui();
  const emptySelectOption = { label: t`Selecionar...`, value: '' };
  const setOpportunityCreateGateHandler = useSetAtom(
    opportunityCreateGateHandlerState,
  );
  const pendingRequest = useAtomValue(opportunityCreateGatePendingRequestState);
  const setPendingRequest = useSetAtom(
    opportunityCreateGatePendingRequestState,
  );

  const { openModal, closeModal } = useModal();
  const { enqueueErrorSnackBar } = useSnackBar();
  const { userTimezone } = useUserTimezone();
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);

  const { createOneRecord: createOpportunity } = useCreateOneRecord({
    objectNameSingular: CoreObjectNameSingular.Opportunity,
  });
  const { createOneRecord: createCompany } = useCreateOneRecord({
    objectNameSingular: CoreObjectNameSingular.Company,
  });
  const { createOneRecord: createPerson } = useCreateOneRecord({
    objectNameSingular: CoreObjectNameSingular.Person,
  });
  const { createOneRecord: createCorporateEvent } = useCreateOneRecord({
    objectNameSingular: 'corporateEvent',
  });
  const { createOneRecord: createEventProposal } = useCreateOneRecord({
    objectNameSingular: 'eventProposal',
  });
  const { objectMetadataItem: companyObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.Company,
    });
  const { objectMetadataItem: personObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.Person,
    });
  // Non-throwing: unlike useObjectMetadataItem, this reports absence instead
  // of throwing, which matters here because eventCatalog (#67/#68) may not
  // be applied to a given workspace's schema yet — the base Externa flow
  // must keep working even then, so Modalidade Interna is only offered, and
  // EventCatalogIdentityField (the only place that calls the
  // eventCatalog-typed hooks that DO throw) only mounts, once this resolves.
  const eventCatalogObjectMetadataItem = useAtomFamilySelectorValue(
    objectMetadataItemFamilySelector,
    {
      objectName: 'eventCatalog',
      objectNameType: 'singular',
    },
  );
  const isEventCatalogAvailable = isDefined(eventCatalogObjectMetadataItem);
  const { createOneRecord: createTask } = useCreateOneRecord({
    objectNameSingular: CoreObjectNameSingular.Task,
  });
  const { createOneRecord: createTaskTarget } = useCreateOneRecord({
    objectNameSingular: CoreObjectNameSingular.TaskTarget,
  });
  const { updateOneRecord } = useUpdateOneRecord();

  const [name, setName] = useState('');
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [personId, setPersonId] = useState<string | null>(null);
  const [venue, setVenue] = useState('');
  const [eventCatalogId, setEventCatalogId] = useState<string | null>(null);
  const [eventCatalog, setEventCatalog] = useState<
    EventCatalogRecord | undefined
  >(undefined);
  const [isLoadingEventCatalog, setIsLoadingEventCatalog] = useState(false);
  const [modality, setModality] = useState('');
  const [eventAt, setEventAt] = useState<string | null>(null);
  const [eventEndAt, setEventEndAt] = useState<string | null>(null);
  const [source, setSource] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cumulative fields, only asked for when created direct into an advanced
  // Kanban column — see getOpportunityCreateCumulativeGateFlags.
  const [eventType, setEventType] = useState('');
  const [audience, setAudience] = useState('');
  const [location, setLocation] = useState('');
  const [city, setCity] = useState('');
  const [isBudgetCompatible, setIsBudgetCompatible] = useState(false);
  const [closedAmount, setClosedAmount] = useState('');
  const [acceptanceEvidence, setAcceptanceEvidence] = useState('');
  const [legalName, setLegalName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [billingEmail, setBillingEmail] = useState('');

  const destinationStageValue = pendingRequest?.recordInput
    .eventProcessStage as string | undefined;
  const {
    requiresQualificationFields,
    requiresAcceptanceFields,
    requiresProductionFields,
  } = getOpportunityCreateCumulativeGateFlags(destinationStageValue);

  const hasModality = modality.length > 0;
  // The eventCatalog picker only renders when isEventCatalogAvailable is
  // also true (see the EventCatalogIdentityField branch below) — gate every
  // other Interno-specific check the same way, so a workspace without the
  // eventCatalog object falls back to the plain name field instead of a
  // permanently-unsatisfiable "Evento" requirement.
  const isInternalModality =
    modality === GSH_EVENT_MODALITY_INTERNAL_VALUE && isEventCatalogAvailable;

  const { records: companies, loading: isLoadingCompany } =
    useFindManyRecords<CompanyFiscalRecord>({
      objectNameSingular: CoreObjectNameSingular.Company,
      filter: { id: { eq: companyId ?? '' } },
      limit: 1,
      skip: !requiresProductionFields || !isDefined(companyId),
    });
  const company = companies[0];
  const isLegalNameMissing = !isFilled(company?.legalName);
  const isTaxIdMissing = !isFilled(company?.taxId);
  const isBillingEmailMissing = !isFilled(company?.billingEmail);

  useEffect(() => {
    setOpportunityCreateGateHandler(
      () =>
        ({ recordInput }: { recordInput: Partial<ObjectRecord> }) => {
          setPendingRequest({ recordInput });
          openModal(OPPORTUNITY_CREATE_GATE_MODAL_ID);

          return false;
        },
    );

    return () => setOpportunityCreateGateHandler(undefined);
  }, [setOpportunityCreateGateHandler, setPendingRequest, openModal]);

  const resetForm = () => {
    setName('');
    setCompanyId(null);
    setPersonId(null);
    setVenue('');
    setEventCatalogId(null);
    setEventCatalog(undefined);
    setIsLoadingEventCatalog(false);
    setModality('');
    setEventAt(null);
    setEventEndAt(null);
    setSource('');
    setEventType('');
    setAudience('');
    setLocation('');
    setCity('');
    setIsBudgetCompatible(false);
    setClosedAmount('');
    setAcceptanceEvidence('');
    setLegalName('');
    setTaxId('');
    setBillingEmail('');
  };

  const handleClose = () => {
    closeModal(OPPORTUNITY_CREATE_GATE_MODAL_ID);
    setPendingRequest(null);
    resetForm();
  };

  const handleCreateCompany = async (searchInput?: string) => {
    const newCompanyId = v4();
    const createdCompany = await createCompany(
      buildRecordLabelPayload({
        id: newCompanyId,
        searchInput,
        objectMetadataItem: companyObjectMetadataItem,
      }),
    );

    if (isDefined(createdCompany)) {
      setCompanyId(createdCompany.id);
    }
  };

  const handleCreatePerson = async (searchInput?: string) => {
    const newPersonId = v4();
    const createdPerson = await createPerson(
      buildRecordLabelPayload({
        id: newPersonId,
        searchInput,
        objectMetadataItem: personObjectMetadataItem,
      }),
    );

    if (isDefined(createdPerson)) {
      setPersonId(createdPerson.id);
    }
  };

  const handleEventCatalogRecordChange = useCallback(
    (record: EventCatalogRecord | undefined, isLoading: boolean) => {
      setEventCatalog(record);
      setIsLoadingEventCatalog(isLoading);
    },
    [],
  );

  const isVenueSatisfied = venue.length > 0;
  const isEventIdentitySatisfied = isInternalModality
    ? isDefined(eventCatalogId) &&
      isDefined(eventCatalog) &&
      !isLoadingEventCatalog
    : name.trim().length > 0;

  const baseFieldRequirements: BaseFieldRequirement[] = [
    ...(isInternalModality
      ? [{ isSatisfied: isVenueSatisfied, label: t`Venue` }]
      : []),
    {
      isSatisfied: isEventIdentitySatisfied,
      label: isInternalModality ? t`Evento` : t`Nome do evento`,
    },
    { isSatisfied: isDefined(companyId), label: t`Empresa` },
    { isSatisfied: hasModality, label: t`Modalidade` },
    { isSatisfied: isDefined(eventAt), label: t`Data de início do evento` },
    { isSatisfied: source.length > 0, label: t`Origem` },
  ];
  const isBaseFormValid = baseFieldRequirements.every(
    (requirement) => requirement.isSatisfied,
  );
  const missingBaseRequirementLabels = baseFieldRequirements
    .filter((requirement) => !requirement.isSatisfied)
    .map((requirement) => requirement.label);

  const parsedAudience = Number(audience);
  const isQualificationFieldsValid =
    !requiresQualificationFields ||
    (eventType.length > 0 &&
      Number.isInteger(parsedAudience) &&
      parsedAudience > 0 &&
      location.trim().length > 0 &&
      city.trim().length > 0 &&
      isBudgetCompatible);

  const parsedClosedAmount = Number(closedAmount);
  const isAcceptanceFieldsValid =
    !requiresAcceptanceFields ||
    (isFilled(closedAmount) &&
      Number.isFinite(parsedClosedAmount) &&
      isFilled(acceptanceEvidence));

  const isProductionFieldsValid =
    !requiresProductionFields ||
    (isDefined(company) &&
      !isLoadingCompany &&
      (!isLegalNameMissing || isFilled(legalName)) &&
      (!isTaxIdMissing || isFilled(taxId)) &&
      (!isBillingEmailMissing || isFilled(billingEmail)));

  const isFormValid =
    isBaseFormValid &&
    isQualificationFieldsValid &&
    isAcceptanceFieldsValid &&
    isProductionFieldsValid;
  const missingRequirementLabels = [
    ...missingBaseRequirementLabels,
    ...(requiresQualificationFields && eventType.length === 0
      ? [t`Tipo de evento`]
      : []),
    ...(requiresQualificationFields &&
    (!Number.isInteger(parsedAudience) || parsedAudience <= 0)
      ? [t`Público estimado`]
      : []),
    ...(requiresQualificationFields && location.trim().length === 0
      ? [t`Local`]
      : []),
    ...(requiresQualificationFields && city.trim().length === 0
      ? [t`Cidade`]
      : []),
    ...(requiresQualificationFields && !isBudgetCompatible
      ? [t`Orçamento compatível`]
      : []),
    ...(requiresAcceptanceFields &&
    (!isFilled(closedAmount) || !Number.isFinite(parsedClosedAmount))
      ? [t`Valor fechado`]
      : []),
    ...(requiresAcceptanceFields && !isFilled(acceptanceEvidence)
      ? [t`Evidência do aceite`]
      : []),
    ...(requiresProductionFields &&
    (!isDefined(company) || isLegalNameMissing) &&
    !isFilled(legalName)
      ? [t`Razão social`]
      : []),
    ...(requiresProductionFields &&
    (!isDefined(company) || isTaxIdMissing) &&
    !isFilled(taxId)
      ? [t`CNPJ`]
      : []),
    ...(requiresProductionFields &&
    (!isDefined(company) || isBillingEmailMissing) &&
    !isFilled(billingEmail)
      ? [t`E-mail de faturamento`]
      : []),
  ];
  const getFieldStatus = (isSatisfied: boolean) =>
    getGateFieldStatus({ isSatisfied, isInherited: false });

  const handleConfirm = async () => {
    if (!isFormValid || !isDefined(pendingRequest)) {
      return;
    }

    setIsSubmitting(true);
    const ownerId = currentWorkspaceMember?.id ?? null;
    const opportunityName = isInternalModality
      ? (eventCatalog?.name ?? '')
      : name.trim();

    try {
      const opportunity = await createOpportunity({
        ...pendingRequest.recordInput,
        name: opportunityName,
        companyId,
        pointOfContactId: personId,
        eventModality: modality,
        eventAt,
        eventEndAt,
        eventSource: source,
        gshFunnel: GSH_EVENT_FUNNEL_CORPORATE_EVENT,
        ownerId,
        ...(isInternalModality && { eventCatalogId }),
        ...(requiresQualificationFields && {
          eventAudience: parsedAudience,
          eventLocation: location.trim(),
          eventBudgetCompatible: isBudgetCompatible,
        }),
        ...(requiresAcceptanceFields && {
          eventClosedAmount: {
            amountMicros: Math.round(parsedClosedAmount * 1_000_000),
            currencyCode: 'BRL',
          },
          eventAcceptanceEvidence: acceptanceEvidence.trim(),
        }),
      });

      // The opportunity is already persisted at this point, so the gate's job
      // is done: close and let the user retry the follow-up steps manually
      // instead of leaving the modal open (which would create a duplicate
      // opportunity on a second confirm).
      handleClose();

      if (requiresQualificationFields) {
        try {
          await createCorporateEvent({
            name: opportunityName,
            eventType,
            city: city.trim(),
            estimatedAudience: parsedAudience,
            startAt: eventAt,
            endAt: eventEndAt,
            opportunityId: opportunity.id,
          });
        } catch {
          enqueueErrorSnackBar({
            message:
              'A oportunidade foi criada, mas os dados do evento não puderam ser salvos automaticamente. Preencha-os manualmente.',
          });
        }
      }

      if (requiresAcceptanceFields) {
        try {
          await createEventProposal({
            name: opportunityName,
            version: 1,
            status: 'ACCEPTED',
            total: {
              amountMicros: Math.round(parsedClosedAmount * 1_000_000),
              currencyCode: 'BRL',
            },
            opportunityId: opportunity.id,
          });
        } catch {
          enqueueErrorSnackBar({
            message:
              'A oportunidade foi criada, mas a proposta aceita não pôde ser registrada automaticamente. Registre-a manualmente.',
          });
        }
      }

      if (requiresProductionFields && isDefined(company)) {
        const companyUpdateInput: Partial<CompanyFiscalRecord> = {};

        if (isLegalNameMissing) {
          companyUpdateInput.legalName = legalName.trim();
        }
        if (isTaxIdMissing) {
          companyUpdateInput.taxId = taxId.trim();
        }
        if (isBillingEmailMissing) {
          companyUpdateInput.billingEmail = billingEmail.trim();
        }

        if (Object.keys(companyUpdateInput).length > 0) {
          try {
            await updateOneRecord({
              objectNameSingular: CoreObjectNameSingular.Company,
              idToUpdate: company.id,
              updateOneRecordInput: companyUpdateInput,
            });
          } catch {
            enqueueErrorSnackBar({
              message:
                'A oportunidade foi criada, mas os dados fiscais da empresa não puderam ser salvos automaticamente. Atualize-os manualmente.',
            });
          }
        }
      }

      try {
        const initialTaskDueAt = getNextBusinessDayIso({
          fromPlainDate: Temporal.Now.plainDateISO(userTimezone),
          timeZone: userTimezone,
        });
        const task = await createTask({
          title: GSH_EVENT_INITIAL_CONTACT_TASK_TITLE,
          dueAt: initialTaskDueAt,
          status: 'TODO',
          assigneeId: ownerId,
        });

        await createTaskTarget({
          taskId: task.id,
          targetOpportunityId: opportunity.id,
        });

        // The Kanban card's "Próxima ação" fields are plain mirrors of the
        // earliest open linked task, which the Status agora widget derives
        // at render time — nothing else sets them for a freshly created task.
        await updateOneRecord({
          objectNameSingular: CoreObjectNameSingular.Opportunity,
          idToUpdate: opportunity.id,
          updateOneRecordInput: {
            eventNextAction: GSH_EVENT_INITIAL_CONTACT_TASK_TITLE,
            eventNextActionAt: initialTaskDueAt,
          },
        });
      } catch {
        enqueueErrorSnackBar({
          message:
            'A oportunidade foi criada, mas a tarefa de contato inicial não pôde ser gerada automaticamente. Crie-a manualmente.',
        });
      }
    } catch (error) {
      enqueueErrorSnackBar({
        apolloError: CombinedGraphQLErrors.is(error) ? error : undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isDefined(pendingRequest)) {
    return null;
  }

  return (
    <ModalStatefulWrapper
      modalInstanceId={OPPORTUNITY_CREATE_GATE_MODAL_ID}
      onClose={handleClose}
      onEnter={handleConfirm}
      isClosable
      size="medium"
      padding="large"
      overlay="dark"
      dataGloballyPreventClickOutside
      renderInDocumentBody
      smallBorderRadius
      autoHeight
    >
      <StyledCenteredTitle>
        <H1Title
          title="Nova oportunidade"
          fontColor={H1TitleFontColor.Primary}
        />
      </StyledCenteredTitle>
      <StyledSectionContainer>
        <Section
          alignment={SectionAlignment.Center}
          fontColor={SectionFontColor.Primary}
        >
          Preencha os campos mínimos para criar esta oportunidade.
        </Section>
      </StyledSectionContainer>

      <StyledFields>
        <GateFieldWrapper status={getFieldStatus(hasModality)}>
          <Select
            dropdownId={`${OPPORTUNITY_CREATE_GATE_MODAL_ID}-modality`}
            label="Modalidade"
            value={modality}
            options={GSH_EVENT_MODALITY_OPTIONS}
            emptyOption={emptySelectOption}
            onChange={setModality}
            isDropdownInModal
            fullWidth
          />
        </GateFieldWrapper>

        {isInternalModality && (
          <EventCatalogVenueField
            venue={venue}
            onVenueChange={setVenue}
            status={getFieldStatus(isVenueSatisfied)}
            dropdownId={`${OPPORTUNITY_CREATE_GATE_MODAL_ID}-venue`}
          />
        )}

        {isInternalModality ? (
          isVenueSatisfied && (
            <EventCatalogIdentityField
              eventCatalogId={eventCatalogId}
              onEventCatalogIdChange={setEventCatalogId}
              onRecordChange={handleEventCatalogRecordChange}
              status={getFieldStatus(isEventIdentitySatisfied)}
              testId={`${OPPORTUNITY_CREATE_GATE_MODAL_ID}-event-catalog`}
            />
          )
        ) : (
          <GateFieldWrapper status={getFieldStatus(isEventIdentitySatisfied)}>
            <SettingsTextInput
              instanceId={`${OPPORTUNITY_CREATE_GATE_MODAL_ID}-name`}
              label="Nome do evento"
              value={name}
              onChange={setName}
              disabled={!hasModality}
              placeholder={
                hasModality ? undefined : 'Escolha a modalidade primeiro'
              }
              autoFocusOnMount={hasModality}
              fullWidth
            />
          </GateFieldWrapper>
        )}

        <GateFieldWrapper status={getFieldStatus(isDefined(companyId))}>
          <FormSingleRecordPicker
            label="Empresa"
            defaultValue={companyId}
            onChange={(value) => setCompanyId((value as string | null) ?? null)}
            onCreate={handleCreateCompany}
            objectNameSingulars={[CoreObjectNameSingular.Company]}
            isDropdownInModal
            testId={`${OPPORTUNITY_CREATE_GATE_MODAL_ID}-company`}
          />
        </GateFieldWrapper>

        <GateFieldWrapper status={getFieldStatus(isDefined(personId))}>
          <FormSingleRecordPicker
            label="Contato"
            defaultValue={personId}
            onChange={(value) => setPersonId((value as string | null) ?? null)}
            onCreate={handleCreatePerson}
            objectNameSingulars={[CoreObjectNameSingular.Person]}
            isDropdownInModal
            testId={`${OPPORTUNITY_CREATE_GATE_MODAL_ID}-person`}
          />
        </GateFieldWrapper>

        <GateFieldWrapper status={getFieldStatus(isDefined(eventAt))}>
          <SettingsTextInput
            instanceId={`${OPPORTUNITY_CREATE_GATE_MODAL_ID}-event-at`}
            label="Data de início do evento"
            type="datetime-local"
            value={toDateTimeLocalInputValue(eventAt)}
            onChange={(value) => setEventAt(fromDateTimeLocalInputValue(value))}
            fullWidth
          />
        </GateFieldWrapper>

        <GateFieldWrapper status={getFieldStatus(isDefined(eventEndAt))}>
          <SettingsTextInput
            instanceId={`${OPPORTUNITY_CREATE_GATE_MODAL_ID}-event-end-at`}
            label="Data de fim do evento (opcional)"
            type="datetime-local"
            value={toDateTimeLocalInputValue(eventEndAt)}
            onChange={(value) =>
              setEventEndAt(fromDateTimeLocalInputValue(value))
            }
            fullWidth
          />
        </GateFieldWrapper>

        <GateFieldWrapper status={getFieldStatus(source.length > 0)}>
          <Select
            dropdownId={`${OPPORTUNITY_CREATE_GATE_MODAL_ID}-source`}
            label="Origem"
            value={source}
            options={GSH_EVENT_SOURCE_OPTIONS}
            emptyOption={emptySelectOption}
            onChange={setSource}
            isDropdownInModal
            fullWidth
          />
        </GateFieldWrapper>

        {requiresQualificationFields && (
          <>
            <StyledGateSectionTitle>{t`Qualificação`}</StyledGateSectionTitle>
            <GateFieldWrapper status={getFieldStatus(eventType.length > 0)}>
              <Select
                dropdownId={`${OPPORTUNITY_CREATE_GATE_MODAL_ID}-event-type`}
                label="Tipo de evento"
                value={eventType}
                options={GSH_EVENT_TYPE_OPTIONS}
                emptyOption={emptySelectOption}
                onChange={setEventType}
                isDropdownInModal
                fullWidth
              />
            </GateFieldWrapper>
            <GateFieldWrapper
              status={getFieldStatus(
                Number.isInteger(parsedAudience) && parsedAudience > 0,
              )}
            >
              <SettingsTextInput
                instanceId={`${OPPORTUNITY_CREATE_GATE_MODAL_ID}-audience`}
                label="Público estimado"
                type="number"
                min={1}
                value={audience}
                onChange={setAudience}
                fullWidth
              />
            </GateFieldWrapper>
            <GateFieldWrapper
              status={getFieldStatus(location.trim().length > 0)}
            >
              <SettingsTextInput
                instanceId={`${OPPORTUNITY_CREATE_GATE_MODAL_ID}-location`}
                label="Local"
                value={location}
                onChange={setLocation}
                fullWidth
              />
            </GateFieldWrapper>
            <GateFieldWrapper status={getFieldStatus(city.trim().length > 0)}>
              <SettingsTextInput
                instanceId={`${OPPORTUNITY_CREATE_GATE_MODAL_ID}-city`}
                label="Cidade"
                value={city}
                onChange={setCity}
                fullWidth
              />
            </GateFieldWrapper>
            <GateFieldWrapper status={getFieldStatus(isBudgetCompatible)}>
              <StyledCheckboxRow>
                <Checkbox
                  checked={isBudgetCompatible}
                  onCheckedChange={setIsBudgetCompatible}
                  aria-label="Orçamento compatível"
                />
                Orçamento compatível
              </StyledCheckboxRow>
            </GateFieldWrapper>
          </>
        )}

        {requiresAcceptanceFields && (
          <>
            <StyledGateSectionTitle>{t`Aceite e cadastro`}</StyledGateSectionTitle>
            <GateFieldWrapper
              status={getFieldStatus(
                isFilled(closedAmount) && Number.isFinite(parsedClosedAmount),
              )}
            >
              <SettingsTextInput
                instanceId={`${OPPORTUNITY_CREATE_GATE_MODAL_ID}-closed-amount`}
                label="Valor fechado (R$)"
                type="number"
                min={0}
                leftAdornment="R$"
                value={closedAmount}
                onChange={setClosedAmount}
                fullWidth
              />
            </GateFieldWrapper>
            <GateFieldWrapper
              status={getFieldStatus(isFilled(acceptanceEvidence))}
            >
              <SettingsTextInput
                instanceId={`${OPPORTUNITY_CREATE_GATE_MODAL_ID}-acceptance-evidence`}
                label="Evidência do aceite"
                placeholder="Link do e-mail, mensagem ou documento que confirma o aceite"
                value={acceptanceEvidence}
                onChange={setAcceptanceEvidence}
                fullWidth
              />
            </GateFieldWrapper>
          </>
        )}

        {requiresProductionFields &&
          isDefined(companyId) &&
          !isLoadingCompany && (
            <>
              <StyledGateSectionTitle>{t`Dados fiscais`}</StyledGateSectionTitle>
              {isLegalNameMissing ? (
                <GateFieldWrapper status={getFieldStatus(isFilled(legalName))}>
                  <SettingsTextInput
                    instanceId={`${OPPORTUNITY_CREATE_GATE_MODAL_ID}-legal-name`}
                    label="Razão social"
                    value={legalName}
                    onChange={setLegalName}
                    fullWidth
                  />
                </GateFieldWrapper>
              ) : (
                <GateFieldWrapper status="inherited">
                  <StyledInheritedValue>
                    {t`Razão social`}: {company?.legalName}
                  </StyledInheritedValue>
                </GateFieldWrapper>
              )}
              {isTaxIdMissing ? (
                <GateFieldWrapper status={getFieldStatus(isFilled(taxId))}>
                  <SettingsTextInput
                    instanceId={`${OPPORTUNITY_CREATE_GATE_MODAL_ID}-tax-id`}
                    label="CNPJ"
                    value={taxId}
                    onChange={setTaxId}
                    fullWidth
                  />
                </GateFieldWrapper>
              ) : (
                <GateFieldWrapper status="inherited">
                  <StyledInheritedValue>
                    {t`CNPJ`}: {company?.taxId}
                  </StyledInheritedValue>
                </GateFieldWrapper>
              )}
              {isBillingEmailMissing ? (
                <GateFieldWrapper
                  status={getFieldStatus(isFilled(billingEmail))}
                >
                  <SettingsTextInput
                    instanceId={`${OPPORTUNITY_CREATE_GATE_MODAL_ID}-billing-email`}
                    label="E-mail de faturamento"
                    value={billingEmail}
                    onChange={setBillingEmail}
                    fullWidth
                  />
                </GateFieldWrapper>
              ) : (
                <GateFieldWrapper status="inherited">
                  <StyledInheritedValue>
                    {t`E-mail de faturamento`}: {company?.billingEmail}
                  </StyledInheritedValue>
                </GateFieldWrapper>
              )}
            </>
          )}
      </StyledFields>

      {!isFormValid && (
        <GateRequirementSummary
          missingRequirementLabels={missingRequirementLabels}
          isLoading={requiresProductionFields && isLoadingCompany}
        />
      )}

      <StyledModalActions>
        <Button
          onClick={handleClose}
          variant="secondary"
          title="Cancelar"
          fullWidth
          justify="center"
        />
        <Button
          onClick={handleConfirm}
          variant="primary"
          accent="blue"
          title="Criar"
          disabled={!isFormValid || isSubmitting}
          isLoading={isSubmitting}
          fullWidth
          justify="center"
        />
      </StyledModalActions>
    </ModalStatefulWrapper>
  );
};
