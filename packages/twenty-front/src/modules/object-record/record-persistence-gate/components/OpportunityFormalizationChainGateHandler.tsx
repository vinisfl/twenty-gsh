import { useCallback } from 'react';
import { t } from '@lingui/core/macro';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { GSH_CONTRACT_TASK_DUE_DAYS } from '@/object-record/record-persistence-gate/constants/GshContractTaskDueDays';
import { GSH_CONTRACT_TASK_TITLE } from '@/object-record/record-persistence-gate/constants/GshContractTaskTitle';
import { GSH_EVENT_SERVICE_ORDER_TASK_TITLE } from '@/object-record/record-persistence-gate/constants/GshEventServiceOrderTaskTitle';
import { GSH_INVOICE_FOLLOWUP_TASK_TITLE } from '@/object-record/record-persistence-gate/constants/GshInvoiceFollowupTaskTitle';
import { GSH_PURCHASE_FORM_TASK_TITLE } from '@/object-record/record-persistence-gate/constants/GshPurchaseFormTaskTitle';
import { useRegisterRecordFieldPersistGateHandler } from '@/object-record/record-persistence-gate/hooks/useRegisterRecordFieldPersistGateHandler';
import { type RecordFieldPersistGateHandler } from '@/object-record/record-persistence-gate/types/RecordFieldPersistGateHandler';
import {
  getIsContractGenerated,
  getIsInvoiceIssuedForContract,
  getIsPurchaseFormSentForInvoice,
  getIsServiceOrderReadyForPurchaseForm,
} from '@/object-record/record-persistence-gate/utils/getFormalizationChainPrerequisites';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';

const EVENT_SERVICE_ORDER_OBJECT_NAME_SINGULAR = 'eventServiceOrder';

type OpportunityChainRecord = ObjectRecord & {
  purchaseFormStatus: string | null;
  invoiceStatus: string | null;
};

type ServiceOrderChainRecord = ObjectRecord & {
  opportunityId: string | null;
  status: string | null;
};

type FormalizationTaskRecord = ObjectRecord & {
  title: string | null;
  status: string | null;
};

type FormalizationTaskTargetRecord = ObjectRecord & {
  targetOpportunityId: string | null;
  task: FormalizationTaskRecord | null;
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
  const { updateOneRecord } = useUpdateOneRecord();

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

  const opportunityIds = opportunities.map((opportunity) => opportunity.id);
  const { records: taskTargets } =
    useFindManyRecords<FormalizationTaskTargetRecord>({
      objectNameSingular: CoreObjectNameSingular.TaskTarget,
      filter: { targetOpportunityId: { in: opportunityIds } },
      recordGqlFields: {
        id: true,
        targetOpportunityId: true,
        task: {
          id: true,
          title: true,
          status: true,
        },
      },
      skip: opportunityIds.length === 0,
    });

  const updateIncompleteTask = useCallback(
    async ({
      opportunityId,
      title,
      updateOneRecordInput,
    }: {
      opportunityId: string;
      title: string;
      updateOneRecordInput: Partial<FormalizationTaskRecord>;
    }) => {
      const task = taskTargets.find(
        (taskTarget) =>
          taskTarget.targetOpportunityId === opportunityId &&
          taskTarget.task?.title === title &&
          taskTarget.task.status !== 'DONE',
      )?.task;

      if (!isDefined(task)) {
        return;
      }

      await updateOneRecord({
        objectNameSingular: CoreObjectNameSingular.Task,
        idToUpdate: task.id,
        updateOneRecordInput,
      });
    },
    [taskTargets, updateOneRecord],
  );

  const handleFormalizationChainFieldPersist: RecordFieldPersistGateHandler =
    useCallback(
      async ({ objectNameSingular, recordId, fieldName, valueToPersist }) => {
        if (
          objectNameSingular === CoreObjectNameSingular.Opportunity &&
          fieldName === 'purchaseFormStatus'
        ) {
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
            getIsPurchaseFormSentForInvoice(
              valueToPersist as string | null | undefined,
            )
          ) {
            try {
              await updateIncompleteTask({
                opportunityId: recordId,
                title: GSH_PURCHASE_FORM_TASK_TITLE,
                updateOneRecordInput: { status: 'DONE' },
              });
            } catch {
              enqueueErrorSnackBar({
                message: t`Não foi possível sincronizar a tarefa do Formulário de Compra.`,
              });
            }
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
            getIsInvoiceIssuedForContract(
              valueToPersist as string | null | undefined,
            )
          ) {
            try {
              await updateIncompleteTask({
                opportunityId: recordId,
                title: GSH_INVOICE_FOLLOWUP_TASK_TITLE,
                updateOneRecordInput: { status: 'DONE' },
              });

              if (!getIsInvoiceIssuedForContract(opportunity?.invoiceStatus)) {
                await updateIncompleteTask({
                  opportunityId: recordId,
                  title: GSH_CONTRACT_TASK_TITLE,
                  updateOneRecordInput: {
                    dueAt: new Date(
                      Date.now() +
                        GSH_CONTRACT_TASK_DUE_DAYS * 24 * 60 * 60 * 1_000,
                    ).toISOString(),
                  },
                });
              }
            } catch {
              enqueueErrorSnackBar({
                message: t`Não foi possível sincronizar as tarefas de Nota Fiscal e Contrato.`,
              });
            }
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

          if (
            getIsContractGenerated(valueToPersist as string | null | undefined)
          ) {
            try {
              await updateIncompleteTask({
                opportunityId: recordId,
                title: GSH_CONTRACT_TASK_TITLE,
                updateOneRecordInput: { status: 'DONE' },
              });
            } catch {
              enqueueErrorSnackBar({
                message: t`Não foi possível sincronizar a tarefa de geração do contrato.`,
              });
            }
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
            isDefined(serviceOrder?.opportunityId)
          ) {
            try {
              await updateIncompleteTask({
                opportunityId: serviceOrder.opportunityId,
                title: GSH_EVENT_SERVICE_ORDER_TASK_TITLE,
                updateOneRecordInput: { status: 'DONE' },
              });
            } catch {
              enqueueErrorSnackBar({
                message: t`Não foi possível sincronizar a tarefa de Ordem de Serviço.`,
              });
            }
          }

          return true;
        }

        return true;
      },
      [
        enqueueErrorSnackBar,
        opportunities,
        serviceOrders,
        updateIncompleteTask,
      ],
    );

  useRegisterRecordFieldPersistGateHandler(
    handleFormalizationChainFieldPersist,
  );

  return null;
};
