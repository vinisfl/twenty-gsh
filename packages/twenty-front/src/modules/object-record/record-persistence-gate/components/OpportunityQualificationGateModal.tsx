import { useCallback, useEffect, useState } from 'react';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useLingui } from '@lingui/react/macro';
import { useAtomValue, useSetAtom } from 'jotai';
import { styled } from '@linaria/react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Button, Checkbox } from 'twenty-ui/input';
import { Section, SectionAlignment, SectionFontColor } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { H1Title, H1TitleFontColor } from 'twenty-ui/typography';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { GateRequirementSummary } from '@/object-record/record-persistence-gate/components/GateRequirementSummary';
import { GateFieldWrapper } from '@/object-record/record-persistence-gate/components/fields/GateFieldWrapper';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { OPPORTUNITY_QUALIFICATION_GATE_MODAL_ID } from '@/object-record/record-persistence-gate/constants/OpportunityQualificationGateModalId';
import { useRegisterOpportunityStageAdvanceGateHandler } from '@/object-record/record-persistence-gate/hooks/useRegisterOpportunityStageAdvanceGateHandler';
import { opportunityStageAdvancePendingRequestState } from '@/object-record/record-persistence-gate/states/opportunityStageAdvancePendingRequestState';
import { type OpportunityStageAdvanceGateHandler } from '@/object-record/record-persistence-gate/types/OpportunityStageAdvanceGateHandler';
import { getIsQualificationToProposalStageAdvance } from '@/object-record/record-persistence-gate/utils/getIsQualificationToProposalStageAdvance';
import { getQualificationToProposalGateRequirements } from '@/object-record/record-persistence-gate/utils/getQualificationToProposalGateRequirements';
import { getGateFieldStatus } from '@/object-record/record-persistence-gate/utils/getGateFieldStatus';
import { toMonetaryAmountDraft } from '@/object-record/record-persistence-gate/utils/toMonetaryAmountDraft';
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

export const OpportunityQualificationGateModal = () => {
  const opportunityObjectMetadataItem = useAtomFamilySelectorValue(
    objectMetadataItemFamilySelector,
    {
      objectName: CoreObjectNameSingular.Opportunity,
      objectNameType: 'singular',
    },
  );
  const corporateEventObjectMetadataItem = useAtomFamilySelectorValue(
    objectMetadataItemFamilySelector,
    {
      objectName: 'corporateEvent',
      objectNameType: 'singular',
    },
  );

  if (
    !isDefined(opportunityObjectMetadataItem) ||
    !isDefined(corporateEventObjectMetadataItem)
  ) {
    return null;
  }

  return <OpportunityQualificationGateModalContent />;
};

const OpportunityQualificationGateModalContent = () => {
  const { t } = useLingui();
  const pendingRequest = useAtomValue(
    opportunityStageAdvancePendingRequestState,
  );
  const setPendingRequest = useSetAtom(
    opportunityStageAdvancePendingRequestState,
  );
  const { openModal, closeModal } = useModal();
  const { enqueueErrorSnackBar } = useSnackBar();
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const { updateOneRecord } = useUpdateOneRecord();
  const { createOneRecord: createCorporateEvent } = useCreateOneRecord({
    objectNameSingular: 'corporateEvent',
  });
  const { createOneRecord: createTask } = useCreateOneRecord({
    objectNameSingular: CoreObjectNameSingular.Task,
  });
  const { createOneRecord: createTaskTarget } = useCreateOneRecord({
    objectNameSingular: CoreObjectNameSingular.TaskTarget,
  });

  // Several gate modals share the stage-advance pending-request atom (one
  // per stage transition — see OpportunityAcceptanceGateModal). This is only
  // "the" pending request when it targets this gate's destination stage;
  // another modal owns it otherwise.
  const isOwnPendingRequest =
    isDefined(pendingRequest) &&
    pendingRequest.destinationStageValue === 'PROPOSAL_NEGOTIATION';

  const { records: opportunities, loading: isLoadingOpportunity } =
    useFindManyRecords({
      objectNameSingular: CoreObjectNameSingular.Opportunity,
      filter: { id: { eq: pendingRequest?.recordId } },
      limit: 1,
      skip: !isOwnPendingRequest,
    });
  const { records: corporateEvents, loading: isLoadingCorporateEvent } =
    useFindManyRecords({
      objectNameSingular: 'corporateEvent',
      filter: { opportunityId: { eq: pendingRequest?.recordId } },
      orderBy: [{ createdAt: 'DescNullsLast' }],
      limit: 1,
      skip: !isOwnPendingRequest,
    });

  const opportunity = opportunities[0];
  const corporateEvent = corporateEvents[0];
  const [eventType, setEventType] = useState('');
  const [audience, setAudience] = useState('');
  const [location, setLocation] = useState('');
  const [city, setCity] = useState('');
  const [eventAt, setEventAt] = useState('');
  const [amount, setAmount] = useState('');
  const [isBudgetCompatible, setIsBudgetCompatible] = useState(false);
  const [initializedRequestId, setInitializedRequestId] = useState<
    string | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const eventTypeOptions = [
    { value: 'COFFEE_BREAK', label: t`Coffee break` },
    { value: 'WELCOME_COFFEE', label: t`Welcome coffee` },
    { value: 'HAPPY_HOUR', label: t`Happy hour` },
    { value: 'COCKTAIL', label: t`Cocktail` },
    { value: 'FAIR', label: t`Fair` },
    { value: 'MEAL', label: t`Meal` },
    { value: 'OTHER', label: t`Other` },
  ];

  const handleQualificationToProposalAdvance: OpportunityStageAdvanceGateHandler =
    useCallback(
      ({ recordId, sourceStageValue, destinationStageValue }) => {
        if (
          !isDefined(destinationStageValue) ||
          !getIsQualificationToProposalStageAdvance({
            sourceStageValue,
            destinationStageValue,
          })
        ) {
          return true;
        }

        setPendingRequest({ recordId, destinationStageValue });
        openModal(OPPORTUNITY_QUALIFICATION_GATE_MODAL_ID);

        return false;
      },
      [openModal, setPendingRequest],
    );

  useRegisterOpportunityStageAdvanceGateHandler(
    handleQualificationToProposalAdvance,
  );

  useEffect(() => {
    if (
      !isDefined(pendingRequest) ||
      !isOwnPendingRequest ||
      isLoadingOpportunity ||
      isLoadingCorporateEvent ||
      initializedRequestId === pendingRequest.recordId
    ) {
      return;
    }

    setEventType(corporateEvent?.eventType ?? '');
    setAudience(
      isDefined(opportunity?.eventAudience)
        ? String(opportunity.eventAudience)
        : '',
    );
    setLocation(opportunity?.eventLocation ?? '');
    setCity(corporateEvent?.city ?? '');
    setEventAt(opportunity?.eventAt ?? '');
    setAmount(
      isDefined(opportunity?.amount?.amountMicros)
        ? String(opportunity.amount.amountMicros / 1_000_000)
        : '',
    );
    setIsBudgetCompatible(opportunity?.eventBudgetCompatible ?? false);
    setInitializedRequestId(pendingRequest.recordId);
  }, [
    corporateEvent,
    initializedRequestId,
    isLoadingCorporateEvent,
    isLoadingOpportunity,
    isOwnPendingRequest,
    opportunity,
    pendingRequest,
  ]);

  const resetForm = () => {
    setEventType('');
    setAudience('');
    setLocation('');
    setCity('');
    setEventAt('');
    setAmount('');
    setIsBudgetCompatible(false);
    setInitializedRequestId(null);
  };

  const handleClose = () => {
    closeModal(OPPORTUNITY_QUALIFICATION_GATE_MODAL_ID);
    setPendingRequest(null);
    resetForm();
  };

  const parsedAudience = Number(audience);
  const amountDraft = toMonetaryAmountDraft(amount);
  const gateRequirements = getQualificationToProposalGateRequirements({
    opportunity: {
      eventAudience: parsedAudience,
      eventLocation: location,
      eventAt,
      amount: amountDraft,
      eventBudgetCompatible: isBudgetCompatible,
    },
    corporateEvent: { eventType, city },
  });
  const isFormValid =
    gateRequirements.isSatisfied &&
    isBudgetCompatible &&
    isDefined(opportunity) &&
    isDefined(pendingRequest);
  const missingRequirementLabels = gateRequirements.missingRequirementKeys.map(
    (key) =>
      ({
        eventType: t`Tipo de evento`,
        audience: t`Público estimado`,
        location: t`Local`,
        city: t`Cidade`,
        eventAt: t`Data do evento`,
        amount: t`Valor estimado`,
        budgetCompatible: t`Orçamento compatível`,
      })[key],
  );
  const getRequirementStatus = (
    key: (typeof gateRequirements.missingRequirementKeys)[number],
    isInherited: boolean,
  ) =>
    getGateFieldStatus({
      isSatisfied: !gateRequirements.missingRequirementKeys.includes(key),
      isInherited,
    });

  const handleConfirm = async () => {
    if (
      !isFormValid ||
      !isDefined(pendingRequest) ||
      !isDefined(opportunity) ||
      !isDefined(amountDraft)
    ) {
      return;
    }

    setIsSubmitting(true);

    try {
      const eventInput = {
        eventType,
        city: city.trim(),
        estimatedAudience: parsedAudience,
        startAt: eventAt,
      };

      if (isDefined(corporateEvent)) {
        await updateOneRecord({
          objectNameSingular: 'corporateEvent',
          idToUpdate: corporateEvent.id,
          updateOneRecordInput: eventInput,
        });
      } else {
        await createCorporateEvent({
          ...eventInput,
          name: opportunity.name ?? 'Evento',
          opportunityId: opportunity.id,
        });
      }

      const task = await createTask({
        title: t`Montar e enviar proposta`,
        dueAt: new Date(Date.now() + 24 * 60 * 60 * 1_000).toISOString(),
        status: 'TODO',
        assigneeId: opportunity.ownerId ?? currentWorkspaceMember?.id ?? null,
      });

      await createTaskTarget({
        taskId: task.id,
        targetOpportunityId: opportunity.id,
      });

      await updateOneRecord({
        objectNameSingular: CoreObjectNameSingular.Opportunity,
        idToUpdate: pendingRequest.recordId,
        updateOneRecordInput: {
          eventProcessStage: pendingRequest.destinationStageValue,
          eventAudience: parsedAudience,
          eventLocation: location.trim(),
          eventAt,
          amount: {
            amountMicros: amountDraft.amountMicros,
            currencyCode: 'BRL',
          },
          eventBudgetCompatible: isBudgetCompatible,
        },
      });

      handleClose();
    } catch (error) {
      enqueueErrorSnackBar({
        apolloError: CombinedGraphQLErrors.is(error) ? error : undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOwnPendingRequest) {
    return null;
  }

  const isLoading = isLoadingOpportunity || isLoadingCorporateEvent;

  return (
    <ModalStatefulWrapper
      modalInstanceId={OPPORTUNITY_QUALIFICATION_GATE_MODAL_ID}
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
          title={t`Avançar para proposta e negociação`}
          fontColor={H1TitleFontColor.Primary}
        />
      </StyledCenteredTitle>
      <StyledSectionContainer>
        <Section
          alignment={SectionAlignment.Center}
          fontColor={SectionFontColor.Primary}
        >
          {t`Complete o briefing e confirme que o orçamento é compatível para avançar esta oportunidade.`}
        </Section>
      </StyledSectionContainer>

      {isLoading ? (
        <Section alignment={SectionAlignment.Center}>
          {t`Carregando dados do evento…`}
        </Section>
      ) : (
        <StyledFields>
          <GateFieldWrapper
            status={getRequirementStatus(
              'eventType',
              eventType === corporateEvent?.eventType,
            )}
          >
            <Select
              dropdownId={`${OPPORTUNITY_QUALIFICATION_GATE_MODAL_ID}-event-type`}
              label={t`Tipo de evento`}
              value={eventType}
              options={eventTypeOptions}
              onChange={setEventType}
              isDropdownInModal
              fullWidth
            />
          </GateFieldWrapper>
          <GateFieldWrapper
            status={getRequirementStatus(
              'audience',
              audience ===
                (isDefined(opportunity?.eventAudience)
                  ? String(opportunity.eventAudience)
                  : ''),
            )}
          >
            <SettingsTextInput
              instanceId={`${OPPORTUNITY_QUALIFICATION_GATE_MODAL_ID}-audience`}
              label={t`Público estimado`}
              type="number"
              min={1}
              value={audience}
              onChange={setAudience}
              fullWidth
            />
          </GateFieldWrapper>
          <GateFieldWrapper
            status={getRequirementStatus(
              'location',
              location === (opportunity?.eventLocation ?? ''),
            )}
          >
            <SettingsTextInput
              instanceId={`${OPPORTUNITY_QUALIFICATION_GATE_MODAL_ID}-location`}
              label={t`Local`}
              value={location}
              onChange={setLocation}
              fullWidth
            />
          </GateFieldWrapper>
          <GateFieldWrapper
            status={getRequirementStatus(
              'city',
              city === (corporateEvent?.city ?? ''),
            )}
          >
            <SettingsTextInput
              instanceId={`${OPPORTUNITY_QUALIFICATION_GATE_MODAL_ID}-city`}
              label={t`Cidade`}
              value={city}
              onChange={setCity}
              fullWidth
            />
          </GateFieldWrapper>
          <GateFieldWrapper
            status={getRequirementStatus(
              'eventAt',
              eventAt === (opportunity?.eventAt ?? ''),
            )}
          >
            <SettingsTextInput
              instanceId={`${OPPORTUNITY_QUALIFICATION_GATE_MODAL_ID}-event-at`}
              label={t`Data do evento`}
              type="datetime-local"
              value={eventAt ? eventAt.slice(0, 16) : ''}
              onChange={(value) =>
                setEventAt(value ? new Date(value).toISOString() : '')
              }
              fullWidth
            />
          </GateFieldWrapper>
          <GateFieldWrapper
            status={getRequirementStatus(
              'amount',
              amount ===
                (isDefined(opportunity?.amount?.amountMicros)
                  ? String(opportunity.amount.amountMicros / 1_000_000)
                  : ''),
            )}
          >
            <SettingsTextInput
              instanceId={`${OPPORTUNITY_QUALIFICATION_GATE_MODAL_ID}-amount`}
              label={t`Valor estimado (R$)`}
              type="number"
              min={0}
              leftAdornment="R$"
              value={amount}
              onChange={setAmount}
              fullWidth
            />
          </GateFieldWrapper>
          <GateFieldWrapper
            status={getRequirementStatus(
              'budgetCompatible',
              isBudgetCompatible ===
                (opportunity?.eventBudgetCompatible ?? false),
            )}
          >
            <StyledCheckboxRow>
              <Checkbox
                checked={isBudgetCompatible}
                onCheckedChange={setIsBudgetCompatible}
                aria-label={t`Orçamento compatível`}
              />
              {t`Orçamento compatível`}
            </StyledCheckboxRow>
          </GateFieldWrapper>
        </StyledFields>
      )}

      {!isFormValid && (
        <GateRequirementSummary
          missingRequirementLabels={missingRequirementLabels}
          isLoading={isLoading}
        />
      )}

      <StyledModalActions>
        <Button
          onClick={handleClose}
          variant="secondary"
          title={t`Cancelar`}
          fullWidth
          justify="center"
        />
        <Button
          onClick={handleConfirm}
          variant="primary"
          accent="blue"
          title={t`Avançar`}
          disabled={!isFormValid || isSubmitting || isLoading}
          isLoading={isSubmitting}
          fullWidth
          justify="center"
        />
      </StyledModalActions>
    </ModalStatefulWrapper>
  );
};
