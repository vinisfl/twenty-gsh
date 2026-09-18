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

import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { GateRequirementSummary } from '@/object-record/record-persistence-gate/components/GateRequirementSummary';
import { GateFieldWrapper } from '@/object-record/record-persistence-gate/components/fields/GateFieldWrapper';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { OPPORTUNITY_CLOSED_GATE_MODAL_ID } from '@/object-record/record-persistence-gate/constants/OpportunityClosedGateModalId';
import { useRegisterOpportunityStageAdvanceGateHandler } from '@/object-record/record-persistence-gate/hooks/useRegisterOpportunityStageAdvanceGateHandler';
import { opportunityStageAdvancePendingRequestState } from '@/object-record/record-persistence-gate/states/opportunityStageAdvancePendingRequestState';
import { type OpportunityStageAdvanceGateHandler } from '@/object-record/record-persistence-gate/types/OpportunityStageAdvanceGateHandler';
import { getIsProductionToClosedStageAdvance } from '@/object-record/record-persistence-gate/utils/getIsProductionToClosedStageAdvance';
import { getProductionToClosedGateRequirements } from '@/object-record/record-persistence-gate/utils/getProductionToClosedGateRequirements';
import { getGateFieldStatus } from '@/object-record/record-persistence-gate/utils/getGateFieldStatus';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { Select } from '@/ui/input/components/Select';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ModalStatefulWrapper } from '@/ui/layout/modal/components/ModalStatefulWrapper';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';

const CORPORATE_EVENT_OBJECT_NAME_SINGULAR = 'corporateEvent';

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

type OpportunityRecord = ObjectRecord & {
  contractStatus: string | null;
};

type CorporateEventRecord = ObjectRecord & {
  executionStatus: string | null;
  assemblyStatus: string | null;
  travelStatus: string | null;
  supplyStatus: string | null;
  teamStatus: string | null;
};

type CreatedCorporateEvent = {
  id: string;
  executionStatus: null;
  assemblyStatus: null;
  travelStatus: null;
  supplyStatus: null;
  teamStatus: null;
};

export const OpportunityClosedGateModal = () => {
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
      objectName: CORPORATE_EVENT_OBJECT_NAME_SINGULAR,
      objectNameType: 'singular',
    },
  );

  if (
    !isDefined(opportunityObjectMetadataItem) ||
    !isDefined(corporateEventObjectMetadataItem)
  ) {
    return null;
  }

  return <OpportunityClosedGateModalContent />;
};

const OpportunityClosedGateModalContent = () => {
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
  const { updateOneRecord } = useUpdateOneRecord();
  const { createOneRecord: createCorporateEvent } = useCreateOneRecord({
    objectNameSingular: CORPORATE_EVENT_OBJECT_NAME_SINGULAR,
  });

  const contractStatusOptions = [
    { value: 'NOT_STARTED', label: t`Não iniciado` },
    { value: 'SENT', label: t`Enviado` },
    { value: 'SIGNED', label: t`Assinado` },
  ];
  const executionStatusOptions = [
    { value: 'NOT_STARTED', label: t`Não iniciada` },
    { value: 'SCHEDULED', label: t`Agendada` },
    { value: 'IN_PROGRESS', label: t`Em execução` },
    { value: 'COMPLETED', label: t`Concluída` },
  ];
  // Shared by all four logistics checklist fields — only the gender
  // agreement of the "ready" label varies (Pronta/Pronto).
  const getChecklistStatusOptions = (readyLabel: string) => [
    { value: 'NOT_APPLICABLE', label: t`Não aplicável` },
    { value: 'PENDING', label: t`Pendente` },
    { value: 'READY', label: readyLabel },
  ];
  const assemblyStatusOptions = getChecklistStatusOptions(t`Pronta`);
  const travelStatusOptions = getChecklistStatusOptions(t`Pronto`);
  const supplyStatusOptions = getChecklistStatusOptions(t`Pronto`);
  const teamStatusOptions = getChecklistStatusOptions(t`Pronta`);

  const [contractStatus, setContractStatus] = useState('');
  const [executionStatus, setExecutionStatus] = useState('');
  const [assemblyStatus, setAssemblyStatus] = useState('');
  const [travelStatus, setTravelStatus] = useState('');
  const [supplyStatus, setSupplyStatus] = useState('');
  const [teamStatus, setTeamStatus] = useState('');
  const [createdCorporateEvent, setCreatedCorporateEvent] =
    useState<CreatedCorporateEvent | null>(null);
  const [initializedRequestId, setInitializedRequestId] = useState<
    string | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingCorporateEvent, setIsCreatingCorporateEvent] =
    useState(false);

  // Several gate modals share this single-handler extension point (one per
  // stage transition — see OpportunityAcceptanceGateModal). This is only
  // "the" pending request when it targets this gate's destination stage;
  // another modal owns it otherwise.
  const isOwnPendingRequest =
    isDefined(pendingRequest) &&
    pendingRequest.destinationStageValue === 'CLOSED';

  const { records: opportunities, loading: isLoadingOpportunity } =
    useFindManyRecords<OpportunityRecord>({
      objectNameSingular: CoreObjectNameSingular.Opportunity,
      filter: { id: { eq: pendingRequest?.recordId } },
      limit: 1,
      skip: !isOwnPendingRequest,
    });
  const { records: corporateEvents, loading: isLoadingCorporateEvent } =
    useFindManyRecords<CorporateEventRecord>({
      objectNameSingular: CORPORATE_EVENT_OBJECT_NAME_SINGULAR,
      filter: { opportunityId: { eq: pendingRequest?.recordId } },
      orderBy: [{ createdAt: 'DescNullsLast' }],
      limit: 1,
      skip: !isOwnPendingRequest,
    });

  const opportunity = opportunities[0];
  const corporateEvent = createdCorporateEvent ?? corporateEvents[0];
  const isLoading = isLoadingOpportunity || isLoadingCorporateEvent;

  const handleProductionToClosedAdvance: OpportunityStageAdvanceGateHandler =
    useCallback(
      ({ recordId, sourceStageValue, destinationStageValue }) => {
        if (
          !isDefined(destinationStageValue) ||
          !getIsProductionToClosedStageAdvance({
            sourceStageValue,
            destinationStageValue,
          })
        ) {
          return true;
        }

        setPendingRequest({ recordId, destinationStageValue });
        openModal(OPPORTUNITY_CLOSED_GATE_MODAL_ID);

        return false;
      },
      [openModal, setPendingRequest],
    );

  useRegisterOpportunityStageAdvanceGateHandler(
    handleProductionToClosedAdvance,
  );

  useEffect(() => {
    if (
      !isDefined(pendingRequest) ||
      !isOwnPendingRequest ||
      isLoading ||
      initializedRequestId === pendingRequest.recordId
    ) {
      return;
    }

    setContractStatus(opportunity?.contractStatus ?? '');
    setExecutionStatus(corporateEvent?.executionStatus ?? '');
    setAssemblyStatus(corporateEvent?.assemblyStatus ?? '');
    setTravelStatus(corporateEvent?.travelStatus ?? '');
    setSupplyStatus(corporateEvent?.supplyStatus ?? '');
    setTeamStatus(corporateEvent?.teamStatus ?? '');
    setInitializedRequestId(pendingRequest.recordId);
  }, [
    corporateEvent,
    initializedRequestId,
    isLoading,
    isOwnPendingRequest,
    opportunity,
    pendingRequest,
  ]);

  const resetForm = () => {
    setContractStatus('');
    setExecutionStatus('');
    setAssemblyStatus('');
    setTravelStatus('');
    setSupplyStatus('');
    setTeamStatus('');
    setCreatedCorporateEvent(null);
    setInitializedRequestId(null);
  };

  const handleClose = () => {
    if (isCreatingCorporateEvent) {
      return;
    }

    closeModal(OPPORTUNITY_CLOSED_GATE_MODAL_ID);
    setPendingRequest(null);
    resetForm();
  };

  const gateRequirements = getProductionToClosedGateRequirements({
    opportunity: { contractStatus },
    corporateEvent: {
      executionStatus,
      assemblyStatus,
      travelStatus,
      supplyStatus,
      teamStatus,
    },
  });

  const isFormValid =
    gateRequirements.isSatisfied &&
    isDefined(opportunity) &&
    isDefined(corporateEvent) &&
    isOwnPendingRequest;
  const missingRequirementLabels = gateRequirements.missingRequirementKeys.map(
    (key) =>
      ({
        contractSigned: t`Contrato assinado`,
        executionCompleted: t`Execução concluída`,
        assemblyReady: t`Montagem`,
        travelReady: t`Deslocamento`,
        supplyReady: t`Abastecimento`,
        teamReady: t`Equipe`,
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

  const handleCreateCorporateEvent = async () => {
    if (!isDefined(opportunity) || isDefined(corporateEvent)) {
      return;
    }

    setIsCreatingCorporateEvent(true);

    try {
      const event = await createCorporateEvent({
        name: opportunity.name ?? t`Evento`,
        opportunityId: opportunity.id,
      });

      setCreatedCorporateEvent({
        id: event.id,
        executionStatus: null,
        assemblyStatus: null,
        travelStatus: null,
        supplyStatus: null,
        teamStatus: null,
      });
    } catch (error) {
      enqueueErrorSnackBar({
        apolloError: CombinedGraphQLErrors.is(error) ? error : undefined,
      });
    } finally {
      setIsCreatingCorporateEvent(false);
    }
  };

  const handleConfirm = async () => {
    if (
      !isFormValid ||
      !isDefined(pendingRequest) ||
      !isDefined(opportunity) ||
      !isDefined(corporateEvent)
    ) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (
        corporateEvent.executionStatus !== executionStatus ||
        corporateEvent.assemblyStatus !== assemblyStatus ||
        corporateEvent.travelStatus !== travelStatus ||
        corporateEvent.supplyStatus !== supplyStatus ||
        corporateEvent.teamStatus !== teamStatus
      ) {
        await updateOneRecord({
          objectNameSingular: CORPORATE_EVENT_OBJECT_NAME_SINGULAR,
          idToUpdate: corporateEvent.id,
          updateOneRecordInput: {
            executionStatus,
            assemblyStatus,
            travelStatus,
            supplyStatus,
            teamStatus,
          },
        });
      }

      await updateOneRecord({
        objectNameSingular: CoreObjectNameSingular.Opportunity,
        idToUpdate: pendingRequest.recordId,
        updateOneRecordInput: {
          eventProcessStage: pendingRequest.destinationStageValue,
          contractStatus,
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

  const hasCorporateEvent = isLoading || isDefined(corporateEvent);

  return (
    <ModalStatefulWrapper
      modalInstanceId={OPPORTUNITY_CLOSED_GATE_MODAL_ID}
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
          title={t`Encerrar oportunidade`}
          fontColor={H1TitleFontColor.Primary}
        />
      </StyledCenteredTitle>
      <StyledSectionContainer>
        <Section
          alignment={SectionAlignment.Center}
          fontColor={SectionFontColor.Primary}
        >
          {t`Confirme o contrato assinado, a execução concluída e o checklist logístico para encerrar esta oportunidade.`}
        </Section>
      </StyledSectionContainer>

      {isLoading ? (
        <Section alignment={SectionAlignment.Center}>
          {t`Carregando dados do evento…`}
        </Section>
      ) : !hasCorporateEvent ? (
        <StyledFields>
          <Section alignment={SectionAlignment.Center}>
            {t`Nenhum evento vinculado a esta oportunidade. Vincule um evento antes de encerrar.`}
          </Section>
          <Button
            onClick={handleCreateCorporateEvent}
            variant="secondary"
            title={t`Criar e vincular evento`}
            disabled={isCreatingCorporateEvent || !isDefined(opportunity)}
            isLoading={isCreatingCorporateEvent}
            fullWidth
            justify="center"
          />
        </StyledFields>
      ) : (
        <StyledFields>
          <GateFieldWrapper
            status={getRequirementStatus(
              'contractSigned',
              contractStatus === (opportunity?.contractStatus ?? ''),
            )}
          >
            <Select
              dropdownId={`${OPPORTUNITY_CLOSED_GATE_MODAL_ID}-contract-status`}
              label={t`Contrato`}
              value={contractStatus}
              options={contractStatusOptions}
              emptyOption={emptySelectOption}
              onChange={setContractStatus}
              isDropdownInModal
              fullWidth
            />
          </GateFieldWrapper>
          <GateFieldWrapper
            status={getRequirementStatus(
              'executionCompleted',
              executionStatus === (corporateEvent?.executionStatus ?? ''),
            )}
          >
            <Select
              dropdownId={`${OPPORTUNITY_CLOSED_GATE_MODAL_ID}-execution-status`}
              label={t`Status da execução`}
              value={executionStatus}
              options={executionStatusOptions}
              emptyOption={emptySelectOption}
              onChange={setExecutionStatus}
              isDropdownInModal
              fullWidth
            />
          </GateFieldWrapper>
          <GateFieldWrapper
            status={getRequirementStatus(
              'assemblyReady',
              assemblyStatus === (corporateEvent?.assemblyStatus ?? ''),
            )}
          >
            <Select
              dropdownId={`${OPPORTUNITY_CLOSED_GATE_MODAL_ID}-assembly-status`}
              label={t`Montagem`}
              value={assemblyStatus}
              options={assemblyStatusOptions}
              emptyOption={emptySelectOption}
              onChange={setAssemblyStatus}
              isDropdownInModal
              fullWidth
            />
          </GateFieldWrapper>
          <GateFieldWrapper
            status={getRequirementStatus(
              'travelReady',
              travelStatus === (corporateEvent?.travelStatus ?? ''),
            )}
          >
            <Select
              dropdownId={`${OPPORTUNITY_CLOSED_GATE_MODAL_ID}-travel-status`}
              label={t`Deslocamento`}
              value={travelStatus}
              options={travelStatusOptions}
              emptyOption={emptySelectOption}
              onChange={setTravelStatus}
              isDropdownInModal
              fullWidth
            />
          </GateFieldWrapper>
          <GateFieldWrapper
            status={getRequirementStatus(
              'supplyReady',
              supplyStatus === (corporateEvent?.supplyStatus ?? ''),
            )}
          >
            <Select
              dropdownId={`${OPPORTUNITY_CLOSED_GATE_MODAL_ID}-supply-status`}
              label={t`Abastecimento`}
              value={supplyStatus}
              options={supplyStatusOptions}
              emptyOption={emptySelectOption}
              onChange={setSupplyStatus}
              isDropdownInModal
              fullWidth
            />
          </GateFieldWrapper>
          <GateFieldWrapper
            status={getRequirementStatus(
              'teamReady',
              teamStatus === (corporateEvent?.teamStatus ?? ''),
            )}
          >
            <Select
              dropdownId={`${OPPORTUNITY_CLOSED_GATE_MODAL_ID}-team-status`}
              label={t`Equipe`}
              value={teamStatus}
              options={teamStatusOptions}
              emptyOption={emptySelectOption}
              onChange={setTeamStatus}
              isDropdownInModal
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
          disabled={isCreatingCorporateEvent}
          fullWidth
          justify="center"
        />
        <Button
          onClick={handleConfirm}
          variant="primary"
          accent="blue"
          title={t`Encerrar`}
          disabled={!isFormValid || isSubmitting || isLoading}
          isLoading={isSubmitting}
          fullWidth
          justify="center"
        />
      </StyledModalActions>
    </ModalStatefulWrapper>
  );
};
