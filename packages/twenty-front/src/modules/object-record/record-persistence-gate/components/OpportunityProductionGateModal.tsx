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
import { GSH_EVENT_SERVICE_ORDER_TASK_TITLE } from '@/object-record/record-persistence-gate/constants/GshEventServiceOrderTaskTitle';
import { OPPORTUNITY_PRODUCTION_GATE_MODAL_ID } from '@/object-record/record-persistence-gate/constants/OpportunityProductionGateModalId';
import { useRegisterOpportunityStageAdvanceGateHandler } from '@/object-record/record-persistence-gate/hooks/useRegisterOpportunityStageAdvanceGateHandler';
import { opportunityStageAdvancePendingRequestState } from '@/object-record/record-persistence-gate/states/opportunityStageAdvancePendingRequestState';
import { type OpportunityStageAdvanceGateHandler } from '@/object-record/record-persistence-gate/types/OpportunityStageAdvanceGateHandler';
import { getAcceptanceToProductionGateRequirements } from '@/object-record/record-persistence-gate/utils/getAcceptanceToProductionGateRequirements';
import { getGateFieldStatus } from '@/object-record/record-persistence-gate/utils/getGateFieldStatus';
import { getIsAcceptanceToProductionStageAdvance } from '@/object-record/record-persistence-gate/utils/getIsAcceptanceToProductionStageAdvance';
import { isFilled } from '@/object-record/record-persistence-gate/utils/isFilled';
import { toMonetaryAmountDraft } from '@/object-record/record-persistence-gate/utils/toMonetaryAmountDraft';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
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
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

type CompanyRecord = ObjectRecord & {
  legalName: string | null;
  taxId: string | null;
  billingEmail: string | null;
};

export const OpportunityProductionGateModal = () => {
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

  return <OpportunityProductionGateModalContent />;
};

const OpportunityProductionGateModalContent = () => {
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

  const [closedAmount, setClosedAmount] = useState('');
  const [acceptanceEvidence, setAcceptanceEvidence] = useState('');
  const [legalName, setLegalName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [billingEmail, setBillingEmail] = useState('');
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
    pendingRequest.destinationStageValue === 'PRODUCTION_FORMALIZATION_EVENT';

  const { records: opportunities, loading: isLoadingOpportunity } =
    useFindManyRecords({
      objectNameSingular: CoreObjectNameSingular.Opportunity,
      filter: { id: { eq: pendingRequest?.recordId } },
      limit: 1,
      skip: !isOwnPendingRequest,
    });

  const opportunity = opportunities[0];

  const { records: companies, loading: isLoadingCompany } =
    useFindManyRecords<CompanyRecord>({
      objectNameSingular: CoreObjectNameSingular.Company,
      filter: { id: { eq: opportunity?.companyId } },
      limit: 1,
      skip: !isOwnPendingRequest || !isDefined(opportunity?.companyId),
    });

  const company = companies[0];
  const isLoading =
    isLoadingOpportunity ||
    (isDefined(opportunity?.companyId) && isLoadingCompany);

  const isLegalNameMissing = !isFilled(company?.legalName);
  const isTaxIdMissing = !isFilled(company?.taxId);
  const isBillingEmailMissing = !isFilled(company?.billingEmail);

  const handleAcceptanceToProductionAdvance: OpportunityStageAdvanceGateHandler =
    useCallback(
      ({ recordId, sourceStageValue, destinationStageValue }) => {
        if (
          !isDefined(destinationStageValue) ||
          !getIsAcceptanceToProductionStageAdvance({
            sourceStageValue,
            destinationStageValue,
          })
        ) {
          return true;
        }

        setPendingRequest({ recordId, destinationStageValue });
        openModal(OPPORTUNITY_PRODUCTION_GATE_MODAL_ID);

        return false;
      },
      [openModal, setPendingRequest],
    );

  useRegisterOpportunityStageAdvanceGateHandler(
    handleAcceptanceToProductionAdvance,
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

    setClosedAmount(
      isDefined(opportunity?.eventClosedAmount?.amountMicros)
        ? String(opportunity.eventClosedAmount.amountMicros / 1_000_000)
        : '',
    );
    setAcceptanceEvidence(opportunity?.eventAcceptanceEvidence ?? '');
    setLegalName(company?.legalName ?? '');
    setTaxId(company?.taxId ?? '');
    setBillingEmail(company?.billingEmail ?? '');
    setInitializedRequestId(pendingRequest.recordId);
  }, [
    company,
    initializedRequestId,
    isLoading,
    isOwnPendingRequest,
    opportunity,
    pendingRequest,
  ]);

  const resetForm = () => {
    setClosedAmount('');
    setAcceptanceEvidence('');
    setLegalName('');
    setTaxId('');
    setBillingEmail('');
    setInitializedRequestId(null);
  };

  const handleClose = () => {
    closeModal(OPPORTUNITY_PRODUCTION_GATE_MODAL_ID);
    setPendingRequest(null);
    resetForm();
  };

  const closedAmountDraft = toMonetaryAmountDraft(closedAmount);
  const gateRequirements = getAcceptanceToProductionGateRequirements({
    opportunity: {
      eventClosedAmount: closedAmountDraft,
      eventAcceptanceEvidence: acceptanceEvidence,
    },
    company: { legalName, taxId, billingEmail },
  });

  const isFormValid =
    gateRequirements.isSatisfied &&
    isDefined(opportunity) &&
    isDefined(company) &&
    isOwnPendingRequest;
  const missingRequirementLabels = gateRequirements.missingRequirementKeys.map(
    (key) =>
      ({
        closedAmount: t`Valor fechado`,
        acceptanceEvidence: t`Evidência do aceite`,
        legalName: t`Razão social`,
        taxId: t`CNPJ`,
        billingEmail: t`E-mail de faturamento`,
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
      !isDefined(company) ||
      !isDefined(closedAmountDraft)
    ) {
      return;
    }

    setIsSubmitting(true);

    try {
      const companyUpdateInput: Partial<CompanyRecord> = {};

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
        await updateOneRecord({
          objectNameSingular: CoreObjectNameSingular.Company,
          idToUpdate: company.id,
          updateOneRecordInput: companyUpdateInput,
        });
      }

      const task = await createTask({
        title: GSH_EVENT_SERVICE_ORDER_TASK_TITLE,
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

  const hasCompany = isLoading || isDefined(company);

  return (
    <ModalStatefulWrapper
      modalInstanceId={OPPORTUNITY_PRODUCTION_GATE_MODAL_ID}
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
          title={t`Avançar para produção/formalização`}
          fontColor={H1TitleFontColor.Primary}
        />
      </StyledCenteredTitle>
      <StyledSectionContainer>
        <Section
          alignment={SectionAlignment.Center}
          fontColor={SectionFontColor.Primary}
        >
          {t`Confirme a evidência do aceite, o valor fechado e os dados fiscais da empresa para avançar esta oportunidade.`}
        </Section>
      </StyledSectionContainer>

      {isLoading ? (
        <Section alignment={SectionAlignment.Center}>
          {t`Carregando dados da empresa…`}
        </Section>
      ) : !hasCompany ? (
        <Section alignment={SectionAlignment.Center}>
          {t`Nenhuma empresa vinculada a esta oportunidade. Vincule uma empresa antes de avançar.`}
        </Section>
      ) : (
        <StyledFields>
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
              instanceId={`${OPPORTUNITY_PRODUCTION_GATE_MODAL_ID}-closed-amount`}
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
              instanceId={`${OPPORTUNITY_PRODUCTION_GATE_MODAL_ID}-acceptance-evidence`}
              label={t`Evidência do aceite`}
              placeholder={t`Link do e-mail, mensagem ou documento que confirma o aceite`}
              value={acceptanceEvidence}
              onChange={setAcceptanceEvidence}
              fullWidth
            />
          </GateFieldWrapper>
          {isLegalNameMissing ? (
            <GateFieldWrapper status={getRequirementStatus('legalName', false)}>
              <SettingsTextInput
                instanceId={`${OPPORTUNITY_PRODUCTION_GATE_MODAL_ID}-legal-name`}
                label={t`Razão social`}
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
            <GateFieldWrapper status={getRequirementStatus('taxId', false)}>
              <SettingsTextInput
                instanceId={`${OPPORTUNITY_PRODUCTION_GATE_MODAL_ID}-tax-id`}
                label={t`CNPJ`}
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
              status={getRequirementStatus('billingEmail', false)}
            >
              <SettingsTextInput
                instanceId={`${OPPORTUNITY_PRODUCTION_GATE_MODAL_ID}-billing-email`}
                label={t`E-mail de faturamento`}
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
