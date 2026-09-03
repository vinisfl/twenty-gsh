import { useEffect, useState } from 'react';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useAtomValue, useSetAtom } from 'jotai';
import { styled } from '@linaria/react';
import { Temporal } from 'temporal-polyfill';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/input';
import { Section, SectionAlignment, SectionFontColor } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { H1Title, H1TitleFontColor } from 'twenty-ui/typography';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { GSH_EVENT_FUNNEL_CORPORATE_EVENT } from '@/object-record/record-persistence-gate/constants/GshEventFunnelCorporateEvent';
import { GSH_EVENT_INITIAL_CONTACT_TASK_TITLE } from '@/object-record/record-persistence-gate/constants/GshEventInitialContactTaskTitle';
import { GSH_EVENT_MODALITY_OPTIONS } from '@/object-record/record-persistence-gate/constants/GshEventModalityOptions';
import { GSH_EVENT_SOURCE_OPTIONS } from '@/object-record/record-persistence-gate/constants/GshEventSourceOptions';
import { OPPORTUNITY_CREATE_GATE_MODAL_ID } from '@/object-record/record-persistence-gate/constants/OpportunityCreateGateModalId';
import { opportunityCreateGateHandlerState } from '@/object-record/record-persistence-gate/states/opportunityCreateGateHandlerState';
import { opportunityCreateGatePendingRequestState } from '@/object-record/record-persistence-gate/states/opportunityCreateGatePendingRequestState';
import { getNextBusinessDayIso } from '@/object-record/record-persistence-gate/utils/getNextBusinessDayIso';
import { FormDateTimeFieldInput } from '@/object-record/record-field/ui/form-types/components/FormDateTimeFieldInput';
import { FormSingleRecordPicker } from '@/object-record/record-field/ui/form-types/components/FormSingleRecordPicker';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { Select } from '@/ui/input/components/Select';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ModalStatefulWrapper } from '@/ui/layout/modal/components/ModalStatefulWrapper';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
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

// GSH-specific: pairs with the extension points added to
// RecordBoardColumnNewRecordButton, CreateNewIndexRecordNoSelectionRecordCommand
// and useRecordBoardDndKit (see ADR-0001). This component registers the app's
// blocking create handler and renders the modal itself, since the sandboxed
// twenty-sdk app can't reach opportunityCreateGateHandlerState.
export const OpportunityCreateGateModal = () => {
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
  const { createOneRecord: createTask } = useCreateOneRecord({
    objectNameSingular: CoreObjectNameSingular.Task,
  });
  const { createOneRecord: createTaskTarget } = useCreateOneRecord({
    objectNameSingular: CoreObjectNameSingular.TaskTarget,
  });

  const [name, setName] = useState('');
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [modality, setModality] = useState('');
  const [eventAt, setEventAt] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setModality('');
    setEventAt(null);
    setAmount('');
    setSource('');
  };

  const handleClose = () => {
    closeModal(OPPORTUNITY_CREATE_GATE_MODAL_ID);
    setPendingRequest(null);
    resetForm();
  };

  const handleCreateCompany = async (searchInput?: string) => {
    const createdCompany = await createCompany({
      name: searchInput?.trim() || 'Nova empresa',
    });

    if (isDefined(createdCompany)) {
      setCompanyId(createdCompany.id);
    }
  };

  const parsedAmount = Number(amount);
  const isFormValid =
    name.trim().length > 0 &&
    isDefined(companyId) &&
    modality.length > 0 &&
    isDefined(eventAt) &&
    Number.isFinite(parsedAmount) &&
    parsedAmount > 0 &&
    source.length > 0;

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
        eventModality: modality,
        eventAt,
        amount: {
          amountMicros: Math.round(parsedAmount * 1_000_000),
          currencyCode: 'BRL',
        },
        eventSource: source,
        gshFunnel: GSH_EVENT_FUNNEL_CORPORATE_EVENT,
        ownerId,
      });

      // The opportunity is already persisted at this point, so the gate's job
      // is done: close and let the user retry the follow-up task manually
      // instead of leaving the modal open (which would create a duplicate
      // opportunity on a second confirm).
      handleClose();

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
          label="Empresa/Contato"
          defaultValue={companyId}
          onChange={(value) => setCompanyId((value as string | null) ?? null)}
          onCreate={handleCreateCompany}
          objectNameSingulars={[CoreObjectNameSingular.Company]}
          testId={`${OPPORTUNITY_CREATE_GATE_MODAL_ID}-company`}
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

        <FormDateTimeFieldInput
          label="Data prevista do evento"
          defaultValue={eventAt ?? undefined}
          onChange={setEventAt}
          timeZone={userTimezone}
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
