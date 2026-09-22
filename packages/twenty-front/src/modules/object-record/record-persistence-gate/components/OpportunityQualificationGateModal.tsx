import { useCallback, useEffect, useState } from 'react';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useLingui } from '@lingui/react/macro';
import { useAtomValue, useSetAtom } from 'jotai';
import { styled } from '@linaria/react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/input';
import { Section, SectionAlignment, SectionFontColor } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { H1Title, H1TitleFontColor } from 'twenty-ui/typography';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { GateRequirementSummary } from '@/object-record/record-persistence-gate/components/GateRequirementSummary';
import { GateFieldWrapper } from '@/object-record/record-persistence-gate/components/fields/GateFieldWrapper';
import {
  GSH_EVENT_ARENA_OPTIONS,
  getGshEventArenaCity,
} from '@/object-record/record-persistence-gate/constants/GshEventArenaOptions';
import { GSH_EVENT_MODALITY_INTERNAL_VALUE } from '@/object-record/record-persistence-gate/constants/GshEventModalityInternalValue';
import { GSH_EVENT_MODALITY_OPTIONS } from '@/object-record/record-persistence-gate/constants/GshEventModalityOptions';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { GSH_PROPOSAL_TASK_TITLE } from '@/object-record/record-persistence-gate/constants/GshProposalTaskTitle';
import { OPPORTUNITY_QUALIFICATION_GATE_MODAL_ID } from '@/object-record/record-persistence-gate/constants/OpportunityQualificationGateModalId';
import { useRegisterOpportunityStageAdvanceGateHandler } from '@/object-record/record-persistence-gate/hooks/useRegisterOpportunityStageAdvanceGateHandler';
import { opportunityStageAdvancePendingRequestState } from '@/object-record/record-persistence-gate/states/opportunityStageAdvancePendingRequestState';
import { type OpportunityStageAdvanceGateHandler } from '@/object-record/record-persistence-gate/types/OpportunityStageAdvanceGateHandler';
import { getIsQualificationToProposalStageAdvance } from '@/object-record/record-persistence-gate/utils/getIsQualificationToProposalStageAdvance';
import { getQualificationToProposalGateRequirements } from '@/object-record/record-persistence-gate/utils/getQualificationToProposalGateRequirements';
import { getGateFieldStatus } from '@/object-record/record-persistence-gate/utils/getGateFieldStatus';
import { PlaceAutocompleteSelect } from '@/geo-map/components/PlaceAutocompleteSelect';
import { useGetPlaceApiData } from '@/geo-map/hooks/useGetPlaceApiData';
import { usePlaceAutocomplete } from '@/geo-map/hooks/usePlaceAutocomplete';
import { Select } from '@/ui/input/components/Select';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
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

const StyledModalActions = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  margin-top: ${themeCssVariables.spacing[6]};

  > div {
    flex: 1;
  }
`;

const StyledLegacyCity = styled.div`
  color: ${themeCssVariables.font.color.secondary};
`;

const OPPORTUNITY_QUALIFICATION_GATE_LOCATION_AUTOCOMPLETE_DROPDOWN_ID =
  'opportunity-qualification-gate-location-autocomplete-dropdown';

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
  const emptySelectOption = { label: t`Selecionar...`, value: '' };
  const pendingRequest = useAtomValue(
    opportunityStageAdvancePendingRequestState,
  );
  const setPendingRequest = useSetAtom(
    opportunityStageAdvancePendingRequestState,
  );
  const { openModal, closeModal } = useModal();
  const { enqueueErrorSnackBar } = useSnackBar();
  const { getPlaceDetailsData } = useGetPlaceApiData();
  const {
    placeAutocompleteData,
    tokenForPlaceApi,
    getAutocompletePlaceData,
    closePlaceAutocomplete,
    resetPlaceAutocomplete,
  } = usePlaceAutocomplete(
    OPPORTUNITY_QUALIFICATION_GATE_LOCATION_AUTOCOMPLETE_DROPDOWN_ID,
  );
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
      recordGqlFields: {
        id: true,
        eventType: true,
        city: true,
        startAt: true,
        endAt: true,
      },
    });

  const opportunity = opportunities[0];
  const corporateEvent = corporateEvents[0];
  const isInternalModality =
    opportunity?.eventModality === GSH_EVENT_MODALITY_INTERNAL_VALUE;
  const [eventType, setEventType] = useState('');
  const [audience, setAudience] = useState('');
  const [location, setLocation] = useState('');
  const [city, setCity] = useState('');
  const [eventAt, setEventAt] = useState('');
  const [eventEndAt, setEventEndAt] = useState<string | null>(null);
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
    // The corporate event is the source of truth once it exists. Keep the
    // opportunity dates as a fallback for legacy opportunities that do not
    // yet have a linked event, so the values remain visible as inherited.
    setEventAt(corporateEvent?.startAt ?? opportunity?.eventAt ?? '');
    setEventEndAt(corporateEvent?.endAt ?? opportunity?.eventEndAt ?? null);
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
    setEventEndAt(null);
    setInitializedRequestId(null);
  };

  const handleClose = () => {
    closeModal(OPPORTUNITY_QUALIFICATION_GATE_MODAL_ID);
    setPendingRequest(null);
    resetForm();
  };

  const parsedAudience = Number(audience);
  const effectiveCity = isInternalModality
    ? (getGshEventArenaCity(location) ?? city)
    : city;
  const gateRequirements = getQualificationToProposalGateRequirements({
    opportunity: {
      eventAudience: parsedAudience,
      eventModality: opportunity?.eventModality,
      eventLocation: location,
      eventAt,
    },
    corporateEvent: { eventType, city: effectiveCity },
  });
  const isFormValid =
    gateRequirements.isSatisfied &&
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

  const handleExternalLocationChange = (value: string) => {
    setLocation(value);
    getAutocompletePlaceData({ address: value });
  };

  const handleExternalPlaceSelection = async (placeId: string) => {
    const selectedPlace = placeAutocompleteData.find(
      (place) => place.placeId === placeId,
    );

    if (!isDefined(selectedPlace)) {
      return;
    }

    setLocation(selectedPlace.text);

    try {
      const placeDetails = await getPlaceDetailsData(
        placeId,
        tokenForPlaceApi ?? '',
      );

      if (isDefined(placeDetails?.city)) {
        setCity(placeDetails.city);
      }
    } catch {
      // Keep the selected address when a provider omits or cannot return details.
    } finally {
      resetPlaceAutocomplete();
    }
  };

  const arenaOptions = GSH_EVENT_ARENA_OPTIONS.some(
    (option) => option.value === location,
  )
    ? GSH_EVENT_ARENA_OPTIONS
    : [
        ...GSH_EVENT_ARENA_OPTIONS,
        ...(location.length > 0 ? [{ value: location, label: location }] : []),
      ];

  const handleConfirm = async () => {
    if (!isFormValid || !isDefined(pendingRequest) || !isDefined(opportunity)) {
      return;
    }

    setIsSubmitting(true);

    try {
      const eventInput = {
        eventType,
        city: effectiveCity.trim(),
        estimatedAudience: parsedAudience,
        startAt: eventAt,
        endAt: eventEndAt,
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
        title: GSH_PROPOSAL_TASK_TITLE,
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
          eventEndAt,
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
          <GateFieldWrapper status="inherited">
            <Select
              dropdownId={`${OPPORTUNITY_QUALIFICATION_GATE_MODAL_ID}-modality`}
              label={t`Modalidade`}
              value={opportunity?.eventModality ?? ''}
              options={GSH_EVENT_MODALITY_OPTIONS}
              emptyOption={emptySelectOption}
              disabled
              fullWidth
            />
          </GateFieldWrapper>
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
              emptyOption={emptySelectOption}
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
          {isInternalModality ? (
            <GateFieldWrapper
              status={getRequirementStatus(
                'location',
                location === (opportunity?.eventLocation ?? ''),
              )}
            >
              <Select
                dropdownId={`${OPPORTUNITY_QUALIFICATION_GATE_MODAL_ID}-arena`}
                label={t`Arena`}
                value={location}
                options={arenaOptions}
                emptyOption={emptySelectOption}
                onChange={setLocation}
                isDropdownInModal
                fullWidth
              />
              {city.length > 0 && (
                <StyledLegacyCity>{t`Cidade: ${city}`}</StyledLegacyCity>
              )}
            </GateFieldWrapper>
          ) : (
            <>
              <GateFieldWrapper
                status={getRequirementStatus(
                  'location',
                  location === (opportunity?.eventLocation ?? ''),
                )}
              >
                <Dropdown
                  dropdownId={
                    OPPORTUNITY_QUALIFICATION_GATE_LOCATION_AUTOCOMPLETE_DROPDOWN_ID
                  }
                  dropdownPlacement="bottom-start"
                  clickableComponentWidth="100%"
                  disableClickForClickableComponent
                  onClickOutside={closePlaceAutocomplete}
                  clickableComponent={
                    <SettingsTextInput
                      instanceId={`${OPPORTUNITY_QUALIFICATION_GATE_MODAL_ID}-location`}
                      label={t`Local`}
                      value={location}
                      onChange={handleExternalLocationChange}
                      autoComplete="off"
                      fullWidth
                    />
                  }
                  dropdownComponents={
                    <PlaceAutocompleteSelect
                      list={placeAutocompleteData}
                      onChange={handleExternalPlaceSelection}
                      dropdownId={
                        OPPORTUNITY_QUALIFICATION_GATE_LOCATION_AUTOCOMPLETE_DROPDOWN_ID
                      }
                    />
                  }
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
            </>
          )}
          <GateFieldWrapper
            status={getRequirementStatus(
              'eventAt',
              eventAt ===
                (corporateEvent?.startAt ?? opportunity?.eventAt ?? ''),
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
            status={getGateFieldStatus({
              isSatisfied: isDefined(eventEndAt),
              isInherited:
                eventEndAt ===
                (corporateEvent?.endAt ?? opportunity?.eventEndAt ?? null),
            })}
          >
            <SettingsTextInput
              instanceId={`${OPPORTUNITY_QUALIFICATION_GATE_MODAL_ID}-event-end-at`}
              label={t`Data de fim do evento`}
              type="datetime-local"
              value={eventEndAt ? eventEndAt.slice(0, 16) : ''}
              onChange={(value) =>
                setEventEndAt(value ? new Date(value).toISOString() : null)
              }
              fullWidth
            />
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
