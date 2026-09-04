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
import { OPPORTUNITY_LOST_CANCELLED_GATE_MODAL_ID } from '@/object-record/record-persistence-gate/constants/OpportunityLostCancelledGateModalId';
import { useRegisterOpportunityStageAdvanceGateHandler } from '@/object-record/record-persistence-gate/hooks/useRegisterOpportunityStageAdvanceGateHandler';
import { opportunityStageAdvancePendingRequestState } from '@/object-record/record-persistence-gate/states/opportunityStageAdvancePendingRequestState';
import { type OpportunityStageAdvanceGateHandler } from '@/object-record/record-persistence-gate/types/OpportunityStageAdvanceGateHandler';
import { getIsLostOrCancelledStageAdvance } from '@/object-record/record-persistence-gate/utils/getIsLostOrCancelledStageAdvance';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { Select } from '@/ui/input/components/Select';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ModalStatefulWrapper } from '@/ui/layout/modal/components/ModalStatefulWrapper';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';

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
  eventLossReason: string | null;
};

export const OpportunityLostCancelledGateModal = () => {
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

  return <OpportunityLostCancelledGateModalContent />;
};

const OpportunityLostCancelledGateModalContent = () => {
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

  const lossReasonOptions = [
    { value: 'PRICE', label: t`Preço` },
    { value: 'DATE', label: t`Data ou disponibilidade` },
    { value: 'SCOPE', label: t`Escopo` },
    { value: 'COMPETITOR', label: t`Concorrente` },
    { value: 'NO_RESPONSE', label: t`Sem retorno` },
    { value: 'OTHER', label: t`Outro` },
  ];

  const [lossReason, setLossReason] = useState('');
  const [initializedRequestId, setInitializedRequestId] = useState<
    string | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Several gate modals share this single-handler extension point (one per
  // stage transition — see OpportunityAcceptanceGateModal). This is only
  // "the" pending request when it targets this gate's destination stage;
  // another modal owns it otherwise. Unlike the other gates, this one owns
  // two destination stages (Perdido and Cancelado), reachable from any
  // origin stage in the funnel.
  const isOwnPendingRequest =
    isDefined(pendingRequest) &&
    (pendingRequest.destinationStageValue === 'LOST' ||
      pendingRequest.destinationStageValue === 'CANCELLED');

  const { records: opportunities, loading: isLoadingOpportunity } =
    useFindManyRecords<OpportunityRecord>({
      objectNameSingular: CoreObjectNameSingular.Opportunity,
      filter: { id: { eq: pendingRequest?.recordId } },
      limit: 1,
      skip: !isOwnPendingRequest,
    });

  const opportunity = opportunities[0];

  const handleLostOrCancelledAdvance: OpportunityStageAdvanceGateHandler =
    useCallback(
      ({ recordId, sourceStageValue, destinationStageValue }) => {
        if (
          !isDefined(destinationStageValue) ||
          !getIsLostOrCancelledStageAdvance({
            sourceStageValue,
            destinationStageValue,
          })
        ) {
          return true;
        }

        setPendingRequest({ recordId, destinationStageValue });
        openModal(OPPORTUNITY_LOST_CANCELLED_GATE_MODAL_ID);

        return false;
      },
      [openModal, setPendingRequest],
    );

  useRegisterOpportunityStageAdvanceGateHandler(handleLostOrCancelledAdvance);

  useEffect(() => {
    if (
      !isDefined(pendingRequest) ||
      !isOwnPendingRequest ||
      isLoadingOpportunity ||
      initializedRequestId === pendingRequest.recordId
    ) {
      return;
    }

    setLossReason(opportunity?.eventLossReason ?? '');
    setInitializedRequestId(pendingRequest.recordId);
  }, [
    initializedRequestId,
    isLoadingOpportunity,
    isOwnPendingRequest,
    opportunity,
    pendingRequest,
  ]);

  const resetForm = () => {
    setLossReason('');
    setInitializedRequestId(null);
  };

  const handleClose = () => {
    closeModal(OPPORTUNITY_LOST_CANCELLED_GATE_MODAL_ID);
    setPendingRequest(null);
    resetForm();
  };

  const isFormValid =
    lossReason.length > 0 && isDefined(opportunity) && isOwnPendingRequest;

  const handleConfirm = async () => {
    if (!isFormValid || !isDefined(pendingRequest) || !isDefined(opportunity)) {
      return;
    }

    setIsSubmitting(true);

    try {
      await updateOneRecord({
        objectNameSingular: CoreObjectNameSingular.Opportunity,
        idToUpdate: pendingRequest.recordId,
        updateOneRecordInput: {
          eventProcessStage: pendingRequest.destinationStageValue,
          eventLossReason: lossReason,
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

  const isCancelling = pendingRequest.destinationStageValue === 'CANCELLED';

  return (
    <ModalStatefulWrapper
      modalInstanceId={OPPORTUNITY_LOST_CANCELLED_GATE_MODAL_ID}
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
          title={
            isCancelling
              ? t`Cancelar oportunidade`
              : t`Marcar oportunidade como perdida`
          }
          fontColor={H1TitleFontColor.Primary}
        />
      </StyledCenteredTitle>
      <StyledSectionContainer>
        <Section
          alignment={SectionAlignment.Center}
          fontColor={SectionFontColor.Primary}
        >
          {t`Informe o motivo da perda/cancelamento para avançar esta oportunidade.`}
        </Section>
      </StyledSectionContainer>

      {isLoadingOpportunity ? (
        <Section alignment={SectionAlignment.Center}>
          {t`Carregando dados da oportunidade…`}
        </Section>
      ) : (
        <StyledFields>
          <Select
            dropdownId={`${OPPORTUNITY_LOST_CANCELLED_GATE_MODAL_ID}-loss-reason`}
            label={t`Motivo da perda/cancelamento`}
            value={lossReason}
            options={lossReasonOptions}
            onChange={setLossReason}
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
          title={t`Confirmar`}
          disabled={!isFormValid || isSubmitting || isLoadingOpportunity}
          isLoading={isSubmitting}
          fullWidth
          justify="center"
        />
      </StyledModalActions>
    </ModalStatefulWrapper>
  );
};
