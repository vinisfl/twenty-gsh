import { useCallback, useState } from 'react';
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
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { OPPORTUNITY_ACCEPTANCE_GATE_MODAL_ID } from '@/object-record/record-persistence-gate/constants/OpportunityAcceptanceGateModalId';
import { useRegisterOpportunityStageAdvanceGateHandler } from '@/object-record/record-persistence-gate/hooks/useRegisterOpportunityStageAdvanceGateHandler';
import { opportunityStageAdvancePendingRequestState } from '@/object-record/record-persistence-gate/states/opportunityStageAdvancePendingRequestState';
import { type OpportunityStageAdvanceGateHandler } from '@/object-record/record-persistence-gate/types/OpportunityStageAdvanceGateHandler';
import { getIsProposalToAcceptanceStageAdvance } from '@/object-record/record-persistence-gate/utils/getIsProposalToAcceptanceStageAdvance';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
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

const StyledRequirements = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  list-style: none;
  margin: 0;
  padding: 0;
`;

const StyledRequirementRow = styled.li<{ isMet: boolean }>`
  color: ${({ isMet }) =>
    isMet
      ? themeCssVariables.font.color.primary
      : themeCssVariables.font.color.danger};
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

const getLatestProposal = (
  proposals: ProposalRecord[],
): ProposalRecord | undefined =>
  [...proposals].sort(
    (left, right) => (right.version ?? 0) - (left.version ?? 0),
  )[0];

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
  const { createOneRecord: createTask } = useCreateOneRecord({
    objectNameSingular: CoreObjectNameSingular.Task,
  });
  const { createOneRecord: createTaskTarget } = useCreateOneRecord({
    objectNameSingular: CoreObjectNameSingular.TaskTarget,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

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
      skip: !isOwnPendingRequest,
    });

  const opportunity = opportunities[0];
  const latestProposal = getLatestProposal(proposals);

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

  const handleClose = () => {
    closeModal(OPPORTUNITY_ACCEPTANCE_GATE_MODAL_ID);
    setPendingRequest(null);
  };

  const isProposalAccepted = latestProposal?.status === 'ACCEPTED';
  const isClosedAmountFilled = isDefined(
    opportunity?.eventClosedAmount?.amountMicros,
  );

  const isFormValid =
    isProposalAccepted &&
    isClosedAmountFilled &&
    isDefined(opportunity) &&
    isOwnPendingRequest;

  const handleConfirm = async () => {
    if (!isFormValid || !isDefined(pendingRequest) || !isDefined(opportunity)) {
      return;
    }

    setIsSubmitting(true);

    try {
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

  const isLoading = isLoadingOpportunity || isLoadingProposals;

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
          {t`Esta oportunidade só pode avançar quando a proposta estiver aceita e o valor fechado estiver preenchido. Ajuste esses dados em "Atualizar evento" se necessário.`}
        </Section>
      </StyledSectionContainer>

      {isLoading ? (
        <Section alignment={SectionAlignment.Center}>
          {t`Carregando dados da proposta…`}
        </Section>
      ) : (
        <StyledRequirements>
          <StyledRequirementRow isMet={isProposalAccepted}>
            {isProposalAccepted
              ? t`✓ Proposta com status "Aceita"`
              : t`✗ Proposta ainda não está com status "Aceita"`}
          </StyledRequirementRow>
          <StyledRequirementRow isMet={isClosedAmountFilled}>
            {isClosedAmountFilled
              ? t`✓ Valor fechado preenchido`
              : t`✗ Valor fechado não preenchido`}
          </StyledRequirementRow>
        </StyledRequirements>
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
