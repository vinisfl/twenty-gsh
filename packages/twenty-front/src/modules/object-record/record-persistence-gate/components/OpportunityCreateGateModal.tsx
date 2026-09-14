import { useEffect, useState } from 'react';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
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
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { buildRecordLabelPayload } from '@/object-record/utils/buildRecordLabelPayload';
import { GSH_EVENT_FUNNEL_CORPORATE_EVENT } from '@/object-record/record-persistence-gate/constants/GshEventFunnelCorporateEvent';
import { GSH_EVENT_INITIAL_CONTACT_TASK_TITLE } from '@/object-record/record-persistence-gate/constants/GshEventInitialContactTaskTitle';
import { GSH_EVENT_MODALITY_OPTIONS } from '@/object-record/record-persistence-gate/constants/GshEventModalityOptions';
import { GSH_EVENT_SOURCE_OPTIONS } from '@/object-record/record-persistence-gate/constants/GshEventSourceOptions';
import { GSH_EVENT_TYPE_OPTIONS } from '@/object-record/record-persistence-gate/constants/GshEventTypeOptions';
import { OPPORTUNITY_CREATE_GATE_MODAL_ID } from '@/object-record/record-persistence-gate/constants/OpportunityCreateGateModalId';
import { opportunityCreateGateHandlerState } from '@/object-record/record-persistence-gate/states/opportunityCreateGateHandlerState';
import { opportunityCreateGatePendingRequestState } from '@/object-record/record-persistence-gate/states/opportunityCreateGatePendingRequestState';
import { fromDateTimeLocalInputValue } from '@/object-record/record-persistence-gate/utils/fromDateTimeLocalInputValue';
import { getNextBusinessDayIso } from '@/object-record/record-persistence-gate/utils/getNextBusinessDayIso';
import { getOpportunityCreateCumulativeGateFlags } from '@/object-record/record-persistence-gate/utils/getOpportunityCreateCumulativeGateFlags';
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

type CompanyFiscalRecord = ObjectRecord & {
  legalName: string | null;
  taxId: string | null;
  billingEmail: string | null;
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

const OpportunityCreateGateModalContent = () => {
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
  const [modality, setModality] = useState('');
  const [eventAt, setEventAt] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
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
    setModality('');
    setEventAt(null);
    setAmount('');
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

  const parsedAmount = Number(amount);
  const isBaseFormValid =
    name.trim().length > 0 &&
    isDefined(companyId) &&
    modality.length > 0 &&
    isDefined(eventAt) &&
    Number.isFinite(parsedAmount) &&
    parsedAmount > 0 &&
    source.length > 0;

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

  const handleConfirm = async () => {
    if (!isFormValid || !isDefined(pendingRequest)) {
      return;
    }

    setIsSubmitting(true);
    const ownerId = currentWorkspaceMember?.id ?? null;

    try {
      const opportunity = await createOpportunity({
        ...pendingRequest.recordInput,
        name: name.trim(),
        companyId,
        pointOfContactId: personId,
        eventModality: modality,
        eventAt,
        amount: {
          amountMicros: Math.round(parsedAmount * 1_000_000),
          currencyCode: 'BRL',
        },
        eventSource: source,
        gshFunnel: GSH_EVENT_FUNNEL_CORPORATE_EVENT,
        ownerId,
        ...(requiresQualificationFields && {
          eventAudience: parsedAudience,
          eventLocation: location.trim(),
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
            name: name.trim(),
            eventType,
            city: city.trim(),
            estimatedAudience: parsedAudience,
            startAt: eventAt,
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
            name: name.trim(),
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
        const task = await createTask({
          title: GSH_EVENT_INITIAL_CONTACT_TASK_TITLE,
          dueAt: getNextBusinessDayIso({
            fromPlainDate: Temporal.Now.plainDateISO(userTimezone),
            timeZone: userTimezone,
          }),
          status: 'TODO',
          assigneeId: ownerId,
        });

        await createTaskTarget({
          taskId: task.id,
          targetOpportunityId: opportunity.id,
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
        <SettingsTextInput
          instanceId={`${OPPORTUNITY_CREATE_GATE_MODAL_ID}-name`}
          label="Nome do evento"
          value={name}
          onChange={setName}
          autoFocusOnMount
          fullWidth
        />

        <FormSingleRecordPicker
          label="Empresa"
          defaultValue={companyId}
          onChange={(value) => setCompanyId((value as string | null) ?? null)}
          onCreate={handleCreateCompany}
          objectNameSingulars={[CoreObjectNameSingular.Company]}
          isDropdownInModal
          testId={`${OPPORTUNITY_CREATE_GATE_MODAL_ID}-company`}
        />

        <FormSingleRecordPicker
          label="Contato"
          defaultValue={personId}
          onChange={(value) => setPersonId((value as string | null) ?? null)}
          onCreate={handleCreatePerson}
          objectNameSingulars={[CoreObjectNameSingular.Person]}
          isDropdownInModal
          testId={`${OPPORTUNITY_CREATE_GATE_MODAL_ID}-person`}
        />

        <Select
          dropdownId={`${OPPORTUNITY_CREATE_GATE_MODAL_ID}-modality`}
          label="Modalidade"
          value={modality}
          options={GSH_EVENT_MODALITY_OPTIONS}
          onChange={setModality}
          isDropdownInModal
          fullWidth
        />

        <SettingsTextInput
          instanceId={`${OPPORTUNITY_CREATE_GATE_MODAL_ID}-event-at`}
          label="Data prevista do evento"
          type="datetime-local"
          value={toDateTimeLocalInputValue(eventAt)}
          onChange={(value) => setEventAt(fromDateTimeLocalInputValue(value))}
          fullWidth
        />

        <SettingsTextInput
          instanceId={`${OPPORTUNITY_CREATE_GATE_MODAL_ID}-amount`}
          label="Valor estimado (R$)"
          type="number"
          min={0}
          leftAdornment="R$"
          value={amount}
          onChange={setAmount}
          fullWidth
        />

        <Select
          dropdownId={`${OPPORTUNITY_CREATE_GATE_MODAL_ID}-source`}
          label="Origem"
          value={source}
          options={GSH_EVENT_SOURCE_OPTIONS}
          onChange={setSource}
          isDropdownInModal
          fullWidth
        />

        {requiresQualificationFields && (
          <>
            <Select
              dropdownId={`${OPPORTUNITY_CREATE_GATE_MODAL_ID}-event-type`}
              label="Tipo de evento"
              value={eventType}
              options={GSH_EVENT_TYPE_OPTIONS}
              onChange={setEventType}
              isDropdownInModal
              fullWidth
            />
            <SettingsTextInput
              instanceId={`${OPPORTUNITY_CREATE_GATE_MODAL_ID}-audience`}
              label="Público estimado"
              type="number"
              min={1}
              value={audience}
              onChange={setAudience}
              fullWidth
            />
            <SettingsTextInput
              instanceId={`${OPPORTUNITY_CREATE_GATE_MODAL_ID}-location`}
              label="Local"
              value={location}
              onChange={setLocation}
              fullWidth
            />
            <SettingsTextInput
              instanceId={`${OPPORTUNITY_CREATE_GATE_MODAL_ID}-city`}
              label="Cidade"
              value={city}
              onChange={setCity}
              fullWidth
            />
            <StyledCheckboxRow>
              <Checkbox
                checked={isBudgetCompatible}
                onCheckedChange={setIsBudgetCompatible}
                aria-label="Orçamento compatível"
              />
              Orçamento compatível
            </StyledCheckboxRow>
          </>
        )}

        {requiresAcceptanceFields && (
          <>
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
            <SettingsTextInput
              instanceId={`${OPPORTUNITY_CREATE_GATE_MODAL_ID}-acceptance-evidence`}
              label="Evidência do aceite"
              placeholder="Link do e-mail, mensagem ou documento que confirma o aceite"
              value={acceptanceEvidence}
              onChange={setAcceptanceEvidence}
              fullWidth
            />
          </>
        )}

        {requiresProductionFields &&
          isDefined(companyId) &&
          !isLoadingCompany &&
          isLegalNameMissing && (
            <SettingsTextInput
              instanceId={`${OPPORTUNITY_CREATE_GATE_MODAL_ID}-legal-name`}
              label="Razão social"
              value={legalName}
              onChange={setLegalName}
              fullWidth
            />
          )}
        {requiresProductionFields &&
          isDefined(companyId) &&
          !isLoadingCompany &&
          isTaxIdMissing && (
            <SettingsTextInput
              instanceId={`${OPPORTUNITY_CREATE_GATE_MODAL_ID}-tax-id`}
              label="CNPJ"
              value={taxId}
              onChange={setTaxId}
              fullWidth
            />
          )}
        {requiresProductionFields &&
          isDefined(companyId) &&
          !isLoadingCompany &&
          isBillingEmailMissing && (
            <SettingsTextInput
              instanceId={`${OPPORTUNITY_CREATE_GATE_MODAL_ID}-billing-email`}
              label="E-mail de faturamento"
              value={billingEmail}
              onChange={setBillingEmail}
              fullWidth
            />
          )}
      </StyledFields>

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
