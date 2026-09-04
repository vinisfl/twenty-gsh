import { useCallback } from 'react';
import { t } from '@lingui/core/macro';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { GSH_CONTRACT_TASK_DUE_DAYS } from '@/object-record/record-persistence-gate/constants/GshContractTaskDueDays';
import { GSH_CONTRACT_TASK_TITLE } from '@/object-record/record-persistence-gate/constants/GshContractTaskTitle';
import { GSH_INVOICE_FOLLOWUP_TASK_TITLE } from '@/object-record/record-persistence-gate/constants/GshInvoiceFollowupTaskTitle';
import { GSH_PURCHASE_FORM_TASK_TITLE } from '@/object-record/record-persistence-gate/constants/GshPurchaseFormTaskTitle';
import { useRegisterRecordFieldPersistGateHandler } from '@/object-record/record-persistence-gate/hooks/useRegisterRecordFieldPersistGateHandler';
import { type RecordFieldPersistGateHandler } from '@/object-record/record-persistence-gate/types/RecordFieldPersistGateHandler';
import {
  getIsInvoiceIssuedForContract,
  getIsPurchaseFormSentForInvoice,
  getIsServiceOrderReadyForPurchaseForm,
} from '@/object-record/record-persistence-gate/utils/getFormalizationChainPrerequisites';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const EVENT_SERVICE_ORDER_OBJECT_NAME_SINGULAR = 'eventServiceOrder';

type OpportunityChainRecord = ObjectRecord & {
  ownerId: string | null;
  purchaseFormStatus: string | null;
  invoiceStatus: string | null;
  contractStatus: string | null;
};

type ServiceOrderChainRecord = ObjectRecord & {
  opportunityId: string | null;
  status: string | null;
};

export const OpportunityFormalizationChainGateHandler = () => {
  const opportunityObjectMetadataItem = useAtomFamilySelectorValue(
    objectMetadataItemFamilySelector,
    {
      objectName: CoreObjectNameSingular.Opportunity,
      objectNameType: 'singular',
    },
  );
  const serviceOrderObjectMetadataItem = useAtomFamilySelectorValue(
    objectMetadataItemFamilySelector,
    {
      objectName: EVENT_SERVICE_ORDER_OBJECT_NAME_SINGULAR,
      objectNameType: 'singular',
    },
  );

  if (
    !isDefined(opportunityObjectMetadataItem) ||
    !isDefined(serviceOrderObjectMetadataItem)
  ) {
    return null;
  }

  return <OpportunityFormalizationChainGateHandlerEffect />;
};

const OpportunityFormalizationChainGateHandlerEffect = () => {
  const { enqueueErrorSnackBar } = useSnackBar();
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const { createOneRecord: createTask } = useCreateOneRecord({
    objectNameSingular: CoreObjectNameSingular.Task,
  });
  const { createOneRecord: createTaskTarget } = useCreateOneRecord({
    objectNameSingular: CoreObjectNameSingular.TaskTarget,
  });

  // Bounded to the stage where the chain applies, so this stays cheap even
  // as the workspace's overall Opportunity history grows.
  const { records: opportunities } = useFindManyRecords<OpportunityChainRecord>(
    {
      objectNameSingular: CoreObjectNameSingular.Opportunity,
      filter: { eventProcessStage: { eq: 'PRODUCTION_FORMALIZATION_EVENT' } },
    },
  );

  // ServiceOrder carries no stage field of its own to filter by; left
  // unfiltered on the assumption that GSH's total service-order volume
  // stays small enough for this to be cheap.
  const { records: serviceOrders } =
    useFindManyRecords<ServiceOrderChainRecord>({
      objectNameSingular: EVENT_SERVICE_ORDER_OBJECT_NAME_SINGULAR,
    });

  const createDripTask = useCallback(
    async ({
      title,
      opportunityId,
      assigneeId,
      dueInDays,
    }: {
      title: string;
      opportunityId: string;
      assigneeId: string | null | undefined;
      dueInDays?: number;
    }) => {
      const task = await createTask({
        title,
        status: 'TODO',
        assigneeId: assigneeId ?? currentWorkspaceMember?.id ?? null,
        ...(isDefined(dueInDays)
          ? {
              dueAt: new Date(
                Date.now() + dueInDays * 24 * 60 * 60 * 1_000,
              ).toISOString(),
            }
          : {}),
      });

      await createTaskTarget({
        taskId: task.id,
        targetOpportunityId: opportunityId,
      });
    },
    [createTask, createTaskTarget, currentWorkspaceMember?.id],
  );

  const handleFormalizationChainFieldPersist: RecordFieldPersistGateHandler =
    useCallback(
      ({ objectNameSingular, recordId, fieldName, valueToPersist }) => {
        if (
          objectNameSingular === CoreObjectNameSingular.Opportunity &&
          fieldName === 'purchaseFormStatus'
        ) {
          const opportunity = opportunities.find(
            (record) => record.id === recordId,
          );
          const serviceOrder = serviceOrders.find(
            (record) => record.opportunityId === recordId,
          );

          if (!getIsServiceOrderReadyForPurchaseForm(serviceOrder?.status)) {
            enqueueErrorSnackBar({
              message: t`Gere a Ordem de Serviço antes de editar o Formulário de Compra.`,
            });
            return false;
          }

          if (
            isDefined(opportunity) &&
            getIsPurchaseFormSentForInvoice(
              valueToPersist as string | null | undefined,
            ) &&
            opportunity.purchaseFormStatus === 'NOT_STARTED'
          ) {
            createDripTask({
              title: GSH_INVOICE_FOLLOWUP_TASK_TITLE,
              opportunityId: recordId,
              assigneeId: opportunity.ownerId,
            }).catch(() => {
              enqueueErrorSnackBar({
                message: t`Não foi possível criar a tarefa de acompanhamento da NF.`,
              });
            });
          }

          return true;
        }

        if (
          objectNameSingular === CoreObjectNameSingular.Opportunity &&
          fieldName === 'invoiceStatus'
        ) {
          const opportunity = opportunities.find(
            (record) => record.id === recordId,
          );

          if (
            !getIsPurchaseFormSentForInvoice(opportunity?.purchaseFormStatus)
          ) {
            enqueueErrorSnackBar({
              message: t`Marque o Formulário de Compra como enviado antes de editar a Nota Fiscal.`,
            });
            return false;
          }

          if (
            isDefined(opportunity) &&
            getIsInvoiceIssuedForContract(
              valueToPersist as string | null | undefined,
            ) &&
            opportunity.invoiceStatus !== 'ISSUED'
          ) {
            createDripTask({
              title: GSH_CONTRACT_TASK_TITLE,
              opportunityId: recordId,
              assigneeId: opportunity.ownerId,
              dueInDays: GSH_CONTRACT_TASK_DUE_DAYS,
            }).catch(() => {
              enqueueErrorSnackBar({
                message: t`Não foi possível criar a tarefa de geração do contrato.`,
              });
            });
          }

          return true;
        }

        if (
          objectNameSingular === CoreObjectNameSingular.Opportunity &&
          fieldName === 'contractStatus'
        ) {
          const opportunity = opportunities.find(
            (record) => record.id === recordId,
          );

          if (!getIsInvoiceIssuedForContract(opportunity?.invoiceStatus)) {
            enqueueErrorSnackBar({
              message: t`Registre a Nota Fiscal antes de editar o Contrato.`,
            });
            return false;
          }

          return true;
        }

        if (
          objectNameSingular === EVENT_SERVICE_ORDER_OBJECT_NAME_SINGULAR &&
          fieldName === 'status'
        ) {
          const serviceOrder = serviceOrders.find(
            (record) => record.id === recordId,
          );

          if (
            getIsServiceOrderReadyForPurchaseForm(
              valueToPersist as string | null | undefined,
            ) &&
            serviceOrder?.status === 'PREPARING' &&
            isDefined(serviceOrder.opportunityId)
          ) {
            const opportunity = opportunities.find(
              (record) => record.id === serviceOrder.opportunityId,
            );

            // Skip rather than fall back to the current user as assignee:
            // every chain task must go to the deal owner, never to whoever
            // happens to be performing the edit.
            if (isDefined(opportunity)) {
              createDripTask({
                title: GSH_PURCHASE_FORM_TASK_TITLE,
                opportunityId: serviceOrder.opportunityId,
                assigneeId: opportunity.ownerId,
              }).catch(() => {
                enqueueErrorSnackBar({
                  message: t`Não foi possível criar a tarefa do Formulário de Compra.`,
                });
              });
            }
          }

          return true;
        }

        return true;
      },
      [createDripTask, enqueueErrorSnackBar, opportunities, serviceOrders],
    );

  useRegisterRecordFieldPersistGateHandler(
    handleFormalizationChainFieldPersist,
  );

  return null;
};
