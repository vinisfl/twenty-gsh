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
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { OPPORTUNITY_CLOSED_GATE_MODAL_ID } from '@/object-record/record-persistence-gate/constants/OpportunityClosedGateModalId';
import { useRegisterOpportunityStageAdvanceGateHandler } from '@/object-record/record-persistence-gate/hooks/useRegisterOpportunityStageAdvanceGateHandler';
import { opportunityStageAdvancePendingRequestState } from '@/object-record/record-persistence-gate/states/opportunityStageAdvancePendingRequestState';
import { type OpportunityStageAdvanceGateHandler } from '@/object-record/record-persistence-gate/types/OpportunityStageAdvanceGateHandler';
import { getIsProductionToClosedStageAdvance } from '@/object-record/record-persistence-gate/utils/getIsProductionToClosedStageAdvance';
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

// Mirrors the checklist status values declared in gsh-events'
// event.object.ts (assemblyStatus/travelStatus/supplyStatus/teamStatus):
// only "Pronto"/"Pronta" and "Não aplicável" satisfy the gate.
const isChecklistItemReady = (value: string | null | undefined): boolean =>
  value === 'READY' || value === 'NOT_APPLICABLE';

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
  const pendingRequest = useAtomValue(
    opportunityStageAdvancePendingRequestState,
  );
  const setPendingRequest = useSetAtom(
    opportunityStageAdvancePendingRequestState,
  );
  const { openModal, closeModal } = useModal();
  const { enqueueErrorSnackBar } = useSnackBar();
  const { updateOneRecord } = useUpdateOneRecord();

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
  const assemblyStatusOptions = [
    { value: 'NOT_APPLICABLE', label: t`Não aplicável` },
    { value: 'PENDING', label: t`Pendente` },
    { value: 'READY', label: t`Pronta` },
  ];
  const travelStatusOptions = [
    { value: 'NOT_APPLICABLE', label: t`Não aplicável` },
    { value: 'PENDING', label: t`Pendente` },
    { value: 'READY', label: t`Pronto` },
  ];
  const supplyStatusOptions = [
    { value: 'NOT_APPLICABLE', label: t`Não aplicável` },
    { value: 'PENDING', label: t`Pendente` },
    { value: 'READY', label: t`Pronto` },
  ];
  const teamStatusOptions = [
    { value: 'NOT_APPLICABLE', label: t`Não aplicável` },
    { value: 'PENDING', label: t`Pendente` },
    { value: 'READY', label: t`Pronta` },
  ];

  const [contractStatus, setContractStatus] = useState('');
  const [executionStatus, setExecutionStatus] = useState('');
  const [assemblyStatus, setAssemblyStatus] = useState('');
  const [travelStatus, setTravelStatus] = useState('');
  const [supplyStatus, setSupplyStatus] = useState('');
  const [teamStatus, setTeamStatus] = useState('');
  const [initializedRequestId, setInitializedRequestId] = useState<
    string | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      limit: 1,
      skip: !isOwnPendingRequest,
    });

  const opportunity = opportunities[0];
  const corporateEvent = corporateEvents[0];
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
    setInitializedRequestId(null);
  };

  const handleClose = () => {
    closeModal(OPPORTUNITY_CLOSED_GATE_MODAL_ID);
    setPendingRequest(null);
    resetForm();
  };

  const isFormValid =
    contractStatus === 'SIGNED' &&
    executionStatus === 'COMPLETED' &&
    isChecklistItemReady(assemblyStatus) &&
    isChecklistItemReady(travelStatus) &&
    isChecklistItemReady(supplyStatus) &&
    isChecklistItemReady(teamStatus) &&
    isDefined(opportunity) &&
    isDefined(corporateEvent) &&
    isOwnPendingRequest;

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
        <Section alignment={SectionAlignment.Center}>
          {t`Nenhum evento vinculado a esta oportunidade. Vincule um evento antes de encerrar.`}
        </Section>
      ) : (
        <StyledFields>
          <Select
            dropdownId={`${OPPORTUNITY_CLOSED_GATE_MODAL_ID}-contract-status`}
            label={t`Contrato`}
            value={contractStatus}
            options={contractStatusOptions}
            onChange={setContractStatus}
            isDropdownInModal
            fullWidth
          />
          <Select
            dropdownId={`${OPPORTUNITY_CLOSED_GATE_MODAL_ID}-execution-status`}
            label={t`Status da execução`}
            value={executionStatus}
            options={executionStatusOptions}
            onChange={setExecutionStatus}
            isDropdownInModal
            fullWidth
          />
          <Select
            dropdownId={`${OPPORTUNITY_CLOSED_GATE_MODAL_ID}-assembly-status`}
            label={t`Montagem`}
            value={assemblyStatus}
            options={assemblyStatusOptions}
            onChange={setAssemblyStatus}
            isDropdownInModal
            fullWidth
          />
          <Select
            dropdownId={`${OPPORTUNITY_CLOSED_GATE_MODAL_ID}-travel-status`}
            label={t`Deslocamento`}
            value={travelStatus}
            options={travelStatusOptions}
            onChange={setTravelStatus}
            isDropdownInModal
            fullWidth
          />
          <Select
            dropdownId={`${OPPORTUNITY_CLOSED_GATE_MODAL_ID}-supply-status`}
            label={t`Abastecimento`}
            value={supplyStatus}
            options={supplyStatusOptions}
            onChange={setSupplyStatus}
            isDropdownInModal
            fullWidth
          />
          <Select
            dropdownId={`${OPPORTUNITY_CLOSED_GATE_MODAL_ID}-team-status`}
            label={t`Equipe`}
            value={teamStatus}
            options={teamStatusOptions}
            onChange={setTeamStatus}
            isDropdownInModal
            fullWidth
          />
        </StyledFields>
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
