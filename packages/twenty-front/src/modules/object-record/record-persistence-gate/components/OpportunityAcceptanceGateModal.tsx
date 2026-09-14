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
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { OPPORTUNITY_ACCEPTANCE_GATE_MODAL_ID } from '@/object-record/record-persistence-gate/constants/OpportunityAcceptanceGateModalId';
import { useRegisterOpportunityStageAdvanceGateHandler } from '@/object-record/record-persistence-gate/hooks/useRegisterOpportunityStageAdvanceGateHandler';
import { opportunityStageAdvancePendingRequestState } from '@/object-record/record-persistence-gate/states/opportunityStageAdvancePendingRequestState';
import { type OpportunityStageAdvanceGateHandler } from '@/object-record/record-persistence-gate/types/OpportunityStageAdvanceGateHandler';
import { getIsProposalToAcceptanceStageAdvance } from '@/object-record/record-persistence-gate/utils/getIsProposalToAcceptanceStageAdvance';
import { getLatestProposal } from '@/object-record/record-persistence-gate/utils/getLatestProposal';
import { getProposalToAcceptanceGateRequirements } from '@/object-record/record-persistence-gate/utils/getProposalToAcceptanceGateRequirements';
import { getGateFieldStatus } from '@/object-record/record-persistence-gate/utils/getGateFieldStatus';
import { toMonetaryAmountDraft } from '@/object-record/record-persistence-gate/utils/toMonetaryAmountDraft';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { Select } from '@/ui/input/components/Select';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ModalStatefulWrapper } from '@/ui/layout/modal/components/ModalStatefulWrapper';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const GSH_EVENT_REGISTRATION_REQUEST_TASK_TITLE =
  'Solicitar ficha cadastral ao cliente';

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

type ProposalRecord = ObjectRecord & {
  version: number | null;
  status: string | null;
};

type CreatedProposal = {
  id: string;
  version: number;
  status: string;
};

export const OpportunityAcceptanceGateModal = () => {
  const opportunityObjectMetadataItem = useAtomFamilySelectorValue(
    objectMetadataItemFamilySelector,
    {
      objectName: CoreObjectNameSingular.Opportunity,
      objectNameType: 'singular',
    },
  );

  if (!isDefined(opportunityObjectMetadataItem)) {
    return null;
  }

  return <OpportunityAcceptanceGateModalContent />;
};

const OpportunityAcceptanceGateModalContent = () => {
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
  const { createOneRecord: createEventProposal } = useCreateOneRecord({
    objectNameSingular: 'eventProposal',
  });
  const { createOneRecord: createTask } = useCreateOneRecord({
    objectNameSingular: CoreObjectNameSingular.Task,
  });
  const { createOneRecord: createTaskTarget } = useCreateOneRecord({
    objectNameSingular: CoreObjectNameSingular.TaskTarget,
  });

  const proposalStatusOptions = [
    { value: 'DRAFT', label: t`Rascunho` },
    { value: 'SENT', label: t`Enviada` },
    { value: 'SUPERSEDED', label: t`Substituída` },
    { value: 'ACCEPTED', label: t`Aceita` },
    { value: 'REJECTED', label: t`Recusada` },
  ];

  const [proposalStatus, setProposalStatus] = useState('');
  const [closedAmount, setClosedAmount] = useState('');
  const [acceptanceEvidence, setAcceptanceEvidence] = useState('');
  const [createdProposal, setCreatedProposal] =
    useState<CreatedProposal | null>(null);
  const [initializedRequestId, setInitializedRequestId] = useState<
    string | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingProposal, setIsCreatingProposal] = useState(false);

  // Several gate modals share this single-handler extension point (one per
  // stage transition — see OpportunityQualificationGateModal). This is only
  // "the" pending request when it targets this gate's destination stage;
  // another modal owns it otherwise.
  const isOwnPendingRequest =
    isDefined(pendingRequest) &&
    pendingRequest.destinationStageValue === 'ACCEPTANCE_REGISTRATION';

  const { records: opportunities, loading: isLoadingOpportunity } =
    useFindManyRecords({
      objectNameSingular: CoreObjectNameSingular.Opportunity,
      filter: { id: { eq: pendingRequest?.recordId } },
      limit: 1,
      skip: !isOwnPendingRequest,
    });
  const { records: proposals, loading: isLoadingProposals } =
    useFindManyRecords<ProposalRecord>({
      objectNameSingular: 'eventProposal',
      filter: { opportunityId: { eq: pendingRequest?.recordId } },
      orderBy: [{ version: 'DescNullsLast' }],
      limit: 1,
      skip: !isOwnPendingRequest,
    });

  const opportunity = opportunities[0];
  const latestProposal = createdProposal ?? getLatestProposal(proposals);
  const isLoading = isLoadingOpportunity || isLoadingProposals;

  const handleProposalToAcceptanceAdvance: OpportunityStageAdvanceGateHandler =
    useCallback(
      ({ recordId, sourceStageValue, destinationStageValue }) => {
        if (
          !isDefined(destinationStageValue) ||
          !getIsProposalToAcceptanceStageAdvance({
            sourceStageValue,
            destinationStageValue,
          })
        ) {
          return true;
        }

        setPendingRequest({ recordId, destinationStageValue });
        openModal(OPPORTUNITY_ACCEPTANCE_GATE_MODAL_ID);

        return false;
      },
      [openModal, setPendingRequest],
    );

  useRegisterOpportunityStageAdvanceGateHandler(
    handleProposalToAcceptanceAdvance,
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

    setProposalStatus(latestProposal?.status ?? '');
    setClosedAmount(
      isDefined(opportunity?.eventClosedAmount?.amountMicros)
        ? String(opportunity.eventClosedAmount.amountMicros / 1_000_000)
        : '',
    );
    setAcceptanceEvidence(opportunity?.eventAcceptanceEvidence ?? '');
    setInitializedRequestId(pendingRequest.recordId);
  }, [
    initializedRequestId,
    isLoading,
    isOwnPendingRequest,
    latestProposal,
    opportunity,
    pendingRequest,
  ]);

  const resetForm = () => {
    setProposalStatus('');
    setClosedAmount('');
    setAcceptanceEvidence('');
    setCreatedProposal(null);
    setInitializedRequestId(null);
  };

  const handleClose = () => {
    if (isCreatingProposal) {
      return;
    }

    closeModal(OPPORTUNITY_ACCEPTANCE_GATE_MODAL_ID);
    setPendingRequest(null);
    resetForm();
  };

  const closedAmountDraft = toMonetaryAmountDraft(closedAmount);
  const gateRequirements = getProposalToAcceptanceGateRequirements({
    opportunity: {
      eventClosedAmount: closedAmountDraft,
      eventAcceptanceEvidence: acceptanceEvidence,
    },
    latestProposal: { status: proposalStatus },
  });

  const isFormValid =
    gateRequirements.isSatisfied &&
    isDefined(opportunity) &&
    isDefined(latestProposal) &&
    isOwnPendingRequest;
  const missingRequirementLabels = gateRequirements.missingRequirementKeys.map(
    (key) =>
      ({
        proposalAccepted: t`Proposta aceita`,
        closedAmount: t`Valor fechado`,
        acceptanceEvidence: t`Evidência do aceite`,
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

  const handleCreateProposal = async () => {
    if (!isDefined(opportunity) || isDefined(latestProposal)) {
      return;
    }

    setIsCreatingProposal(true);

    try {
      const proposal = await createEventProposal({
        name: opportunity.name ?? t`Proposta`,
        opportunityId: opportunity.id,
        status: 'DRAFT',
        version: 1,
      });

      setCreatedProposal({
        id: proposal.id,
        status: 'DRAFT',
        version: 1,
      });
      setProposalStatus('DRAFT');
    } catch (error) {
      enqueueErrorSnackBar({
        apolloError: CombinedGraphQLErrors.is(error) ? error : undefined,
      });
    } finally {
      setIsCreatingProposal(false);
    }
  };

  const handleConfirm = async () => {
    if (
      !isFormValid ||
      !isDefined(pendingRequest) ||
      !isDefined(opportunity) ||
      !isDefined(latestProposal) ||
      !isDefined(closedAmountDraft)
    ) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (latestProposal.status !== proposalStatus) {
        await updateOneRecord({
          objectNameSingular: 'eventProposal',
          idToUpdate: latestProposal.id,
          updateOneRecordInput: { status: proposalStatus },
        });
      }

      const task = await createTask({
        title: GSH_EVENT_REGISTRATION_REQUEST_TASK_TITLE,
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
          eventClosedAmount: {
            amountMicros: closedAmountDraft.amountMicros,
            currencyCode: 'BRL',
          },
          eventAcceptanceEvidence: acceptanceEvidence.trim(),
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

  const hasProposal = isLoading || isDefined(latestProposal);

  return (
    <ModalStatefulWrapper
      modalInstanceId={OPPORTUNITY_ACCEPTANCE_GATE_MODAL_ID}
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
          title={t`Avançar para aceite e cadastro`}
          fontColor={H1TitleFontColor.Primary}
        />
      </StyledCenteredTitle>
      <StyledSectionContainer>
        <Section
          alignment={SectionAlignment.Center}
          fontColor={SectionFontColor.Primary}
        >
          {t`Confirme a proposta aceita, o valor fechado e a evidência do aceite para avançar esta oportunidade.`}
        </Section>
      </StyledSectionContainer>

      {isLoading ? (
        <Section alignment={SectionAlignment.Center}>
          {t`Carregando dados da proposta…`}
        </Section>
      ) : !hasProposal ? (
        <StyledFields>
          <Section alignment={SectionAlignment.Center}>
            {t`Nenhuma proposta encontrada para esta oportunidade. Crie uma proposta antes de avançar.`}
          </Section>
          <Button
            onClick={handleCreateProposal}
            variant="secondary"
            title={t`Criar proposta`}
            disabled={isCreatingProposal || !isDefined(opportunity)}
            isLoading={isCreatingProposal}
            fullWidth
            justify="center"
          />
        </StyledFields>
      ) : (
        <StyledFields>
          <GateFieldWrapper
            status={getRequirementStatus(
              'proposalAccepted',
              proposalStatus === latestProposal?.status,
            )}
          >
            <Select
              dropdownId={`${OPPORTUNITY_ACCEPTANCE_GATE_MODAL_ID}-proposal-status`}
              label={t`Status da proposta`}
              value={proposalStatus}
              options={proposalStatusOptions}
              onChange={setProposalStatus}
              isDropdownInModal
              fullWidth
            />
          </GateFieldWrapper>
          <GateFieldWrapper
            status={getRequirementStatus(
              'closedAmount',
              closedAmount ===
                (isDefined(opportunity?.eventClosedAmount?.amountMicros)
                  ? String(
                      opportunity.eventClosedAmount.amountMicros / 1_000_000,
                    )
                  : ''),
            )}
          >
            <SettingsTextInput
              instanceId={`${OPPORTUNITY_ACCEPTANCE_GATE_MODAL_ID}-closed-amount`}
              label={t`Valor fechado (R$)`}
              type="number"
              min={0}
              leftAdornment="R$"
              value={closedAmount}
              onChange={setClosedAmount}
              fullWidth
            />
          </GateFieldWrapper>
          <GateFieldWrapper
            status={getRequirementStatus(
              'acceptanceEvidence',
              acceptanceEvidence ===
                (opportunity?.eventAcceptanceEvidence ?? ''),
            )}
          >
            <SettingsTextInput
              instanceId={`${OPPORTUNITY_ACCEPTANCE_GATE_MODAL_ID}-acceptance-evidence`}
              label={t`Evidência do aceite`}
              placeholder={t`Link do e-mail, mensagem ou documento que confirma o aceite`}
              value={acceptanceEvidence}
              onChange={setAcceptanceEvidence}
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
          disabled={isCreatingProposal}
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
