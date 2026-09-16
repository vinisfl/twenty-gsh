import {
  Fragment,
  type CSSProperties,
  useCallback,
  useEffect,
  useState,
} from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineFrontComponent } from 'twenty-sdk/define';
import { ptBR } from 'date-fns/locale';
import {
  Trans,
  enqueueSnackbar,
  useFrontComponentExecutionContext,
  useTranslate,
} from 'twenty-sdk/front-component';

import { STATUS_NOW_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import {
  getStepStatus,
  type StepStatus,
} from 'src/front-components/utils/get-step-status.util';
import {
  getNextOpenTask,
  getNextOpenTaskWithTitle,
  hasLinkedTaskWithTitle,
  type LinkedTask,
} from 'src/front-components/utils/get-next-open-task.util';
import { ensureResizeObserver } from 'src/front-components/utils/ensure-resize-observer.util';
import {
  getIsContractGenerated,
  getIsInvoiceIssuedForContract,
  getIsPurchaseFormSentForInvoice,
  getIsServiceOrderReadyForPurchaseForm,
} from 'src/front-components/utils/get-formalization-chain-prerequisites.util';
import {
  CONTRACT_STATUS,
  INVOICE_STATUS,
  PURCHASE_FORM_STATUS,
  SERVICE_ORDER_STATUS,
} from 'src/constants/domain-options';
import {
  GSH_CONTRACT_TASK_TITLE,
  GSH_EVENT_SERVICE_ORDER_TASK_TITLE,
  GSH_INVOICE_FOLLOWUP_TASK_TITLE,
  GSH_PURCHASE_FORM_TASK_TITLE,
} from 'src/constants/gsh-task-titles';
import { GSH_CONTRACT_TASK_DUE_DAYS } from 'src/constants/gsh-contract-task-due-days';
import { EVENT_CURRENT_SITUATION_OPTIONS } from 'src/fields/opportunity-current-situation.field';
import { EVENT_PROCESS_STAGE_OPTIONS } from 'src/fields/opportunity-process-stage.field';

import 'react-datepicker/dist/react-datepicker.css';
import './status-now-date-picker.css';

ensureResizeObserver();
registerLocale('pt-BR', ptBR);

const theme = {
  spacing1: 'var(--t-spacing-1)',
  spacing2: 'var(--t-spacing-2)',
  spacing3: 'var(--t-spacing-3)',
  spacing4: 'var(--t-spacing-4)',
  border: 'var(--t-border-color-medium)',
  borderLight: 'var(--t-border-color-light)',
  backgroundPrimary: 'var(--t-background-primary)',
  fontPrimary: 'var(--t-font-color-primary)',
  fontTertiary: 'var(--t-font-color-tertiary)',
  fontFamily: 'var(--t-font-family)',
  sizeXs: 'var(--t-font-size-xs)',
  sizeSm: 'var(--t-font-size-sm)',
};

const styles: Record<string, CSSProperties> = {
  shell: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing3,
    padding: theme.spacing4,
    background: theme.backgroundPrimary,
    borderBottom: `1px solid ${theme.borderLight}`,
    fontFamily: theme.fontFamily,
    fontSize: theme.sizeSm,
    color: theme.fontPrimary,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing3,
    flexWrap: 'wrap',
  },
  fieldLabel: {
    color: theme.fontTertiary,
    fontSize: theme.sizeXs,
    fontWeight: 500,
  },
  section: { display: 'flex', flexDirection: 'column', gap: theme.spacing1 },
  stepperColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing1,
  },
  stepperRow: { display: 'flex', alignItems: 'center', width: '100%' },
  connector: { flex: 1, height: '2px', minWidth: theme.spacing2 },
  currentStepLabel: { fontSize: theme.sizeXs, fontWeight: 600 },
  empty: { color: theme.fontTertiary, fontSize: theme.sizeXs },
  pendingAlert: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing3,
    padding: theme.spacing3,
    border: '1px solid var(--t-tag-text-orange)',
    borderRadius: 'var(--t-border-radius-sm)',
    background: 'var(--t-tag-background-orange)',
  },
  pendingContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing1,
    minWidth: 0,
  },
  pendingText: {
    color: 'var(--t-tag-text-orange)',
    fontWeight: 500,
    overflowWrap: 'anywhere',
  },
  nextAction: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing2,
    padding: theme.spacing3,
    border: `1px solid ${theme.borderLight}`,
    borderRadius: 'var(--t-border-radius-sm)',
  },
  nextActionDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing1,
    minWidth: 0,
  },
  nextActionTitle: { fontWeight: 600, overflowWrap: 'anywhere' },
  nextActionDate: { color: theme.fontTertiary, fontSize: theme.sizeXs },
  actionControls: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing2,
  },
  rescheduleControls: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: theme.spacing2,
    width: '100%',
    minWidth: 0,
  },
  actionButton: {
    padding: `${theme.spacing1} ${theme.spacing2}`,
    border: `1px solid ${theme.border}`,
    borderRadius: 'var(--t-border-radius-sm)',
    background: theme.backgroundPrimary,
    color: theme.fontPrimary,
    fontFamily: theme.fontFamily,
    fontSize: theme.sizeXs,
    fontWeight: 600,
    cursor: 'pointer',
  },
  inlineSelect: {
    width: '100%',
    padding: theme.spacing2,
    border: `1px solid ${theme.border}`,
    borderRadius: 'var(--t-border-radius-sm)',
    background: theme.backgroundPrimary,
    color: theme.fontPrimary,
    fontFamily: theme.fontFamily,
    fontSize: theme.sizeSm,
  },
  completeButton: {
    borderColor: 'var(--t-tag-text-green)',
    color: 'var(--t-tag-text-green)',
  },
  resolveButton: {
    flexShrink: 0,
    padding: `${theme.spacing1} ${theme.spacing2}`,
    border: '1px solid var(--t-tag-text-orange)',
    borderRadius: 'var(--t-border-radius-sm)',
    background: theme.backgroundPrimary,
    color: 'var(--t-tag-text-orange)',
    fontFamily: theme.fontFamily,
    fontSize: theme.sizeXs,
    fontWeight: 600,
    cursor: 'pointer',
  },
};

type StageOption = (typeof EVENT_PROCESS_STAGE_OPTIONS)[number];

// The first 5 of the 8 stage options are the funnel steps; the remaining 3
// (Closed/Lost/Cancelled) are terminal outcomes, not steps of the stepper.
const FUNNEL_STEPS: StageOption[] = EVENT_PROCESS_STAGE_OPTIONS.slice(0, 5);

const chipStyle = (color: string, status: StepStatus): CSSProperties =>
  status === 'upcoming'
    ? {
        display: 'inline-flex',
        alignItems: 'center',
        gap: theme.spacing1,
        padding: `${theme.spacing1} ${theme.spacing2}`,
        borderRadius: '999px',
        border: `1px dashed ${theme.border}`,
        color: theme.fontTertiary,
        fontSize: theme.sizeXs,
        whiteSpace: 'nowrap',
      }
    : {
        display: 'inline-flex',
        alignItems: 'center',
        gap: theme.spacing1,
        padding: `${theme.spacing1} ${theme.spacing2}`,
        borderRadius: '999px',
        border: `1px solid var(--t-tag-text-${color})`,
        background: `var(--t-tag-background-${color})`,
        color: `var(--t-tag-text-${color})`,
        fontSize: theme.sizeXs,
        fontWeight: status === 'current' ? 600 : 500,
        whiteSpace: 'nowrap',
      };

// A dot per step (not the full label) so the row never wraps in the narrow
// side panel — labels are long ("5. Produção / formalização / evento") and
// five of them side by side don't fit. The current step's label is shown
// separately, on its own line, instead of on every dot.
const dotStyle = (color: string, status: StepStatus): CSSProperties => {
  if (status === 'upcoming') {
    return {
      width: '10px',
      height: '10px',
      borderRadius: '50%',
      flexShrink: 0,
      border: `2px solid ${theme.border}`,
      background: theme.backgroundPrimary,
    };
  }

  if (status === 'current') {
    return {
      width: '12px',
      height: '12px',
      borderRadius: '50%',
      flexShrink: 0,
      background: `var(--t-tag-text-${color})`,
      boxShadow: `0 0 0 3px var(--t-tag-background-${color})`,
    };
  }

  return {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    flexShrink: 0,
    background: `var(--t-tag-text-${color})`,
  };
};

const Stepper = ({ currentValue }: { currentValue: string | null }) => {
  const currentIndex = FUNNEL_STEPS.findIndex(
    (step) => step.value === currentValue,
  );
  const currentStep = currentIndex === -1 ? null : FUNNEL_STEPS[currentIndex];

  return (
    <div style={styles.stepperColumn}>
      <div style={styles.stepperRow}>
        {FUNNEL_STEPS.map((step, index) => {
          const status = getStepStatus(index, currentIndex);
          return (
            <Fragment key={step.value}>
              <span title={step.label} style={dotStyle(step.color, status)} />
              {index < FUNNEL_STEPS.length - 1 ? (
                <span
                  style={{
                    ...styles.connector,
                    background:
                      status === 'completed'
                        ? `var(--t-tag-text-${step.color})`
                        : theme.border,
                  }}
                />
              ) : null}
            </Fragment>
          );
        })}
      </div>
      <span
        style={{
          ...styles.currentStepLabel,
          color: currentStep
            ? `var(--t-tag-text-${currentStep.color})`
            : theme.fontTertiary,
        }}
      >
        {currentStep ? currentStep.label : 'Etapa não reconhecida'}
      </span>
    </div>
  );
};

const SituationChip = ({ value }: { value: string | null }) => {
  const option = EVENT_CURRENT_SITUATION_OPTIONS.find(
    (item) => item.value === value,
  );

  if (!option) {
    return <span style={styles.empty}>Sem situação registrada</span>;
  }

  return <span style={chipStyle(option.color, 'current')}>{option.label}</span>;
};

type OpportunityStatusRecord = {
  eventProcessStage: string | null;
  eventCurrentSituation: string | null;
  eventCurrentPending: string | null;
  eventNextAction: string | null;
  eventNextActionAt: string | null;
  purchaseFormStatus: string | null;
  invoiceStatus: string | null;
  contractStatus: string | null;
  serviceOrder: { id: string; status: string | null } | null;
  tasks: LinkedTask[];
};

type StatusOption = { value: string; label: string };

type FormalizationTaskKind =
  'SERVICE_ORDER' | 'PURCHASE_FORM' | 'INVOICE' | 'CONTRACT';

type FormalizationPanel = {
  task: LinkedTask;
  kind: FormalizationTaskKind;
  label: string;
  options: StatusOption[];
  value: string;
};

const serviceOrderStatusOptions: StatusOption[] = [
  { value: SERVICE_ORDER_STATUS.PREPARING, label: 'Em preparação' },
  { value: SERVICE_ORDER_STATUS.ISSUED, label: 'Emitida' },
  { value: SERVICE_ORDER_STATUS.DISTRIBUTED, label: 'Distribuída' },
  { value: SERVICE_ORDER_STATUS.COMPLETED, label: 'Concluída' },
];

const purchaseFormStatusOptions: StatusOption[] = [
  { value: PURCHASE_FORM_STATUS.NOT_STARTED, label: 'Não iniciado' },
  { value: PURCHASE_FORM_STATUS.SENT, label: 'Enviado' },
  { value: PURCHASE_FORM_STATUS.COMPLETED, label: 'Concluído' },
];

const invoiceStatusOptions: StatusOption[] = [
  { value: INVOICE_STATUS.NOT_REQUESTED, label: 'Não solicitada' },
  { value: INVOICE_STATUS.REQUESTED, label: 'Solicitada' },
  { value: INVOICE_STATUS.ISSUED, label: 'Emitida' },
];

const contractStatusOptions: StatusOption[] = [
  { value: CONTRACT_STATUS.NOT_STARTED, label: 'Não iniciado' },
  { value: CONTRACT_STATUS.SENT, label: 'Enviado' },
  { value: CONTRACT_STATUS.SIGNED, label: 'Assinado' },
];

type OpportunityFormalizationField =
  'purchaseFormStatus' | 'invoiceStatus' | 'contractStatus';

type FormalizationTaskDefinition = {
  title: string;
  label: string;
  options: StatusOption[];
  isCompletionStatus: (value: string | null | undefined) => boolean;
  getValue: (record: OpportunityStatusRecord | null) => string;
  getPrerequisiteError: (
    record: OpportunityStatusRecord | null,
  ) => string | null;
  applyValue: (
    record: OpportunityStatusRecord,
    value: string,
  ) => OpportunityStatusRecord;
} & (
  | { target: 'SERVICE_ORDER' }
  | { target: 'OPPORTUNITY'; field: OpportunityFormalizationField }
);

const formalizationTaskDefinitions: Record<
  FormalizationTaskKind,
  FormalizationTaskDefinition
> = {
  SERVICE_ORDER: {
    title: GSH_EVENT_SERVICE_ORDER_TASK_TITLE,
    label: 'Status da Ordem de Serviço',
    options: serviceOrderStatusOptions,
    target: 'SERVICE_ORDER',
    isCompletionStatus: getIsServiceOrderReadyForPurchaseForm,
    getValue: (record) =>
      record?.serviceOrder?.status ?? SERVICE_ORDER_STATUS.PREPARING,
    getPrerequisiteError: () => null,
    applyValue: (record, value) => ({
      ...record,
      serviceOrder: record.serviceOrder
        ? { ...record.serviceOrder, status: value }
        : record.serviceOrder,
    }),
  },
  PURCHASE_FORM: {
    title: GSH_PURCHASE_FORM_TASK_TITLE,
    label: 'Formulário de Compra',
    options: purchaseFormStatusOptions,
    target: 'OPPORTUNITY',
    field: 'purchaseFormStatus',
    isCompletionStatus: getIsPurchaseFormSentForInvoice,
    getValue: (record) =>
      record?.purchaseFormStatus ?? PURCHASE_FORM_STATUS.NOT_STARTED,
    getPrerequisiteError: (record) =>
      getIsServiceOrderReadyForPurchaseForm(record?.serviceOrder?.status)
        ? null
        : 'Gere a Ordem de Serviço antes de editar o Formulário de Compra.',
    applyValue: (record, value) => ({ ...record, purchaseFormStatus: value }),
  },
  INVOICE: {
    title: GSH_INVOICE_FOLLOWUP_TASK_TITLE,
    label: 'Nota Fiscal',
    options: invoiceStatusOptions,
    target: 'OPPORTUNITY',
    field: 'invoiceStatus',
    isCompletionStatus: getIsInvoiceIssuedForContract,
    getValue: (record) => record?.invoiceStatus ?? INVOICE_STATUS.NOT_REQUESTED,
    getPrerequisiteError: (record) =>
      getIsPurchaseFormSentForInvoice(record?.purchaseFormStatus)
        ? null
        : 'Marque o Formulário de Compra como enviado antes de editar a Nota Fiscal.',
    applyValue: (record, value) => ({ ...record, invoiceStatus: value }),
  },
  CONTRACT: {
    title: GSH_CONTRACT_TASK_TITLE,
    label: 'Contrato',
    options: contractStatusOptions,
    target: 'OPPORTUNITY',
    field: 'contractStatus',
    isCompletionStatus: getIsContractGenerated,
    getValue: (record) => record?.contractStatus ?? CONTRACT_STATUS.NOT_STARTED,
    getPrerequisiteError: (record) =>
      getIsInvoiceIssuedForContract(record?.invoiceStatus)
        ? null
        : 'Registre a Nota Fiscal antes de editar o Contrato.',
    applyValue: (record, value) => ({ ...record, contractStatus: value }),
  },
};

const getFormalizationTaskKind = (
  title: string | null,
): FormalizationTaskKind | null =>
  (
    Object.entries(formalizationTaskDefinitions) as [
      FormalizationTaskKind,
      FormalizationTaskDefinition,
    ][]
  ).find(([, definition]) => definition.title === title?.trim())?.[0] ?? null;

const getFormalizationPanel = (
  task: LinkedTask,
  record: OpportunityStatusRecord | null,
): FormalizationPanel | null => {
  const kind = getFormalizationTaskKind(task.title);

  if (!kind) {
    return null;
  }

  const definition = formalizationTaskDefinitions[kind];

  return {
    task,
    kind,
    label: definition.label,
    options: definition.options,
    value: definition.getValue(record),
  };
};

const formatDateTime = (value: string | null): string => {
  if (!value) {
    return 'Sem data definida';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Sem data definida';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
};

const StatusNow = () => {
  const { t } = useTranslate();
  const opportunityId = useFrontComponentExecutionContext(
    (context) =>
      context.recordId ??
      (context.selectedRecordIds.length === 1
        ? context.selectedRecordIds[0]
        : null),
  );
  const [record, setRecord] = useState<OpportunityStatusRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isResolvingPending, setIsResolvingPending] = useState(false);
  const [isUpdatingNextAction, setIsUpdatingNextAction] = useState(false);
  const [rescheduleValue, setRescheduleValue] = useState<Date | null>(null);
  const [formalizationPanel, setFormalizationPanel] =
    useState<FormalizationPanel | null>(null);

  const load = useCallback(async () => {
    if (!opportunityId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(false);
    try {
      const result = (await new CoreApiClient().query({
        opportunity: {
          __args: { filter: { id: { eq: opportunityId } } },
          eventProcessStage: true,
          eventCurrentSituation: true,
          eventCurrentPending: true,
          eventNextAction: true,
          eventNextActionAt: true,
          purchaseFormStatus: true,
          invoiceStatus: true,
          contractStatus: true,
          eventServiceOrders: {
            edges: {
              node: { id: true, status: true },
            },
          },
        },
        taskTargets: {
          __args: { filter: { targetOpportunityId: { eq: opportunityId } } },
          edges: {
            node: {
              task: {
                id: true,
                title: true,
                dueAt: true,
                status: true,
                position: true,
              },
            },
          },
        },
      } as never)) as unknown as {
        opportunity?: {
          eventProcessStage?: string | null;
          eventCurrentSituation?: string | null;
          eventCurrentPending?: string | null;
          eventNextAction?: string | null;
          eventNextActionAt?: string | null;
          purchaseFormStatus?: string | null;
          invoiceStatus?: string | null;
          contractStatus?: string | null;
          eventServiceOrders?: {
            edges?: Array<{
              node: { id?: string | null; status?: string | null };
            }>;
          } | null;
        } | null;
        taskTargets?: {
          edges?: Array<{
            node: {
              task?: {
                id?: string | null;
                title?: string | null;
                dueAt?: string | null;
                status?: string | null;
                position?: number | null;
              } | null;
            };
          }>;
        } | null;
      };

      const found = result?.opportunity;
      const serviceOrder = found?.eventServiceOrders?.edges?.find(
        ({ node }) => node.id,
      )?.node;
      const tasks: LinkedTask[] = [];
      for (const { node } of result?.taskTargets?.edges ?? []) {
        const task = node.task;
        if (task?.id) {
          tasks.push({
            id: task.id,
            title: task.title ?? null,
            dueAt: task.dueAt ?? null,
            status: task.status ?? null,
            position: task.position ?? null,
          });
        }
      }
      setRecord({
        eventProcessStage: found?.eventProcessStage ?? null,
        eventCurrentSituation: found?.eventCurrentSituation ?? null,
        eventCurrentPending: found?.eventCurrentPending ?? null,
        eventNextAction: found?.eventNextAction ?? null,
        eventNextActionAt: found?.eventNextActionAt ?? null,
        purchaseFormStatus: found?.purchaseFormStatus ?? null,
        invoiceStatus: found?.invoiceStatus ?? null,
        contractStatus: found?.contractStatus ?? null,
        serviceOrder: serviceOrder?.id
          ? { id: serviceOrder.id, status: serviceOrder.status ?? null }
          : null,
        tasks,
      });
    } catch {
      setError(true);
    }
    setLoading(false);
  }, [opportunityId]);

  useEffect(() => {
    void load();
  }, [load]);

  const resolveCurrentPending = async () => {
    if (!opportunityId || isResolvingPending) {
      return;
    }

    setIsResolvingPending(true);
    try {
      const result = await new CoreApiClient().mutation({
        updateOpportunity: {
          __args: {
            id: opportunityId,
            data: { eventCurrentPending: null },
          },
          id: true,
        },
      });

      if (!result.updateOpportunity?.id) {
        throw new Error('Opportunity update did not return a record');
      }

      setRecord((currentRecord) =>
        currentRecord
          ? { ...currentRecord, eventCurrentPending: null }
          : currentRecord,
      );
    } catch {
      await enqueueSnackbar({
        message: t('Não foi possível resolver a pendência. Tente novamente.'),
        variant: 'error',
      });
    } finally {
      setIsResolvingPending(false);
    }
  };

  const createLinkedTask = async (title: string, dueAt: string | null) => {
    if (!opportunityId) {
      throw new Error(t('Oportunidade não encontrada.'));
    }

    const client = new CoreApiClient();
    const taskResult = await client.mutation({
      createTask: {
        __args: { data: { title, dueAt, status: 'TODO' } },
        id: true,
        title: true,
        dueAt: true,
        status: true,
        position: true,
      },
    });
    const task = taskResult.createTask as LinkedTask | undefined;

    if (!task?.id) {
      throw new Error(t('Não foi possível criar a tarefa.'));
    }

    const targetResult = await client.mutation({
      createTaskTarget: {
        __args: {
          data: { taskId: task.id, targetOpportunityId: opportunityId },
        },
        id: true,
      },
    });

    if (!targetResult.createTaskTarget?.id) {
      throw new Error(t('Não foi possível vincular a tarefa à oportunidade.'));
    }

    setRecord((currentRecord) =>
      currentRecord
        ? { ...currentRecord, tasks: [...currentRecord.tasks, task] }
        : currentRecord,
    );

    return task;
  };

  const getOrCreateNextTask = async () => {
    const legacyNextAction = record?.eventNextAction?.trim();
    const nextTask = record
      ? legacyNextAction
        ? getNextOpenTaskWithTitle(record.tasks, legacyNextAction)
        : getNextOpenTask(record.tasks)
      : undefined;

    if (nextTask) {
      return nextTask;
    }

    if (
      !legacyNextAction ||
      (record && hasLinkedTaskWithTitle(record.tasks, legacyNextAction))
    ) {
      throw new Error(t('Não existe uma próxima ação para atualizar.'));
    }

    return createLinkedTask(
      legacyNextAction,
      record?.eventNextActionAt ?? null,
    );
  };

  const updateTask = async (
    id: string,
    data: { dueAt?: string; status?: 'DONE' },
  ) => {
    const result = await new CoreApiClient().mutation({
      updateTask: {
        __args: { id, data },
        id: true,
      },
    });

    if (!result.updateTask?.id) {
      throw new Error(t('Não foi possível atualizar a tarefa.'));
    }
  };

  const persistFormalizationStatus = async (
    panel: FormalizationPanel,
    value: string,
  ) => {
    const client = new CoreApiClient();
    const definition = formalizationTaskDefinitions[panel.kind];

    if (definition.target === 'SERVICE_ORDER') {
      const serviceOrderId = record?.serviceOrder?.id;

      if (!serviceOrderId) {
        throw new Error(
          t('Não foi possível encontrar a Ordem de Serviço vinculada.'),
        );
      }

      const result = (await client.mutation({
        updateEventServiceOrder: {
          __args: { id: serviceOrderId, data: { status: value } },
          id: true,
        },
      } as never)) as unknown as { updateEventServiceOrder?: { id?: string } };

      if (!result.updateEventServiceOrder?.id) {
        throw new Error(t('Não foi possível atualizar a Ordem de Serviço.'));
      }

      return;
    }

    if (!opportunityId) {
      throw new Error(t('Oportunidade não encontrada.'));
    }

    const result = (await client.mutation({
      updateOpportunity: {
        __args: { id: opportunityId, data: { [definition.field]: value } },
        id: true,
      },
    } as never)) as unknown as { updateOpportunity?: { id?: string } };

    if (!result.updateOpportunity?.id) {
      throw new Error(t('Não foi possível atualizar a oportunidade.'));
    }
  };

  const storeRescheduleHistory = async ({
    taskTitle,
    previousDueAt,
    dueAt,
  }: {
    taskTitle: string | null;
    previousDueAt: string | null;
    dueAt: string;
  }) => {
    if (!opportunityId) {
      throw new Error(t('Oportunidade não encontrada.'));
    }

    const noteResult = await new CoreApiClient().mutation({
      createNote: {
        __args: {
          data: {
            title: 'Próxima ação reagendada',
            bodyV2: {
              markdown: [
                `A próxima ação **${taskTitle ?? 'sem título'}** foi reagendada.`,
                '',
                `De: ${formatDateTime(previousDueAt)}`,
                `Para: ${formatDateTime(dueAt)}`,
              ].join('\n'),
            },
          },
        },
        id: true,
      },
    });

    if (!noteResult.createNote?.id) {
      throw new Error(
        t('Não foi possível armazenar o histórico do reagendamento.'),
      );
    }

    const targetResult = await new CoreApiClient().mutation({
      createNoteTarget: {
        __args: {
          data: {
            noteId: noteResult.createNote.id,
            targetOpportunityId: opportunityId,
          },
        },
        id: true,
      },
    });

    if (!targetResult.createNoteTarget?.id) {
      throw new Error(
        t('Não foi possível vincular o histórico à oportunidade.'),
      );
    }
  };

  const completeNextAction = async () => {
    if (isUpdatingNextAction) {
      return;
    }

    setIsUpdatingNextAction(true);
    try {
      const task = await getOrCreateNextTask();
      const panel = getFormalizationPanel(task, record);

      if (panel) {
        setFormalizationPanel(panel);
        return;
      }

      await updateTask(task.id, { status: 'DONE' });

      setRecord((currentRecord) =>
        currentRecord
          ? {
              ...currentRecord,
              eventNextAction: null,
              eventNextActionAt: null,
              tasks: currentRecord.tasks.map((currentTask) =>
                currentTask.id === task.id
                  ? { ...currentTask, status: 'DONE' }
                  : currentTask,
              ),
            }
          : currentRecord,
      );
    } catch (updateError) {
      await enqueueSnackbar({
        message:
          updateError instanceof Error
            ? updateError.message
            : t('Não foi possível concluir a próxima ação. Tente novamente.'),
        variant: 'error',
      });
    } finally {
      setIsUpdatingNextAction(false);
    }
  };

  const saveFormalizationStatus = async () => {
    if (!formalizationPanel || isUpdatingNextAction) {
      return;
    }

    setIsUpdatingNextAction(true);
    try {
      const definition = formalizationTaskDefinitions[formalizationPanel.kind];
      const prerequisiteError = definition.getPrerequisiteError(record);

      if (prerequisiteError) {
        throw new Error(t(prerequisiteError));
      }

      if (!definition.isCompletionStatus(formalizationPanel.value)) {
        throw new Error(
          t('Selecione um status que conclua esta tarefa antes de salvar.'),
        );
      }

      const shouldSetContractDueAt =
        formalizationPanel.kind === 'INVOICE' &&
        !getIsInvoiceIssuedForContract(record?.invoiceStatus);
      const contractTask = shouldSetContractDueAt
        ? getNextOpenTaskWithTitle(record?.tasks ?? [], GSH_CONTRACT_TASK_TITLE)
        : undefined;
      const contractDueAt = contractTask
        ? new Date(
            Date.now() + GSH_CONTRACT_TASK_DUE_DAYS * 24 * 60 * 60 * 1_000,
          ).toISOString()
        : undefined;

      await persistFormalizationStatus(
        formalizationPanel,
        formalizationPanel.value,
      );
      await updateTask(formalizationPanel.task.id, { status: 'DONE' });

      if (contractTask && contractDueAt) {
        await updateTask(contractTask.id, { dueAt: contractDueAt });
      }

      setRecord((currentRecord) => {
        if (!currentRecord) {
          return currentRecord;
        }

        const value = formalizationPanel.value;
        const updatedRecord = {
          ...currentRecord,
          eventNextAction: null,
          eventNextActionAt: null,
          tasks: currentRecord.tasks.map((task) => {
            if (task.id === formalizationPanel.task.id) {
              return { ...task, status: 'DONE' };
            }

            if (contractTask && task.id === contractTask.id && contractDueAt) {
              return { ...task, dueAt: contractDueAt };
            }

            return task;
          }),
        };

        return definition.applyValue(updatedRecord, value);
      });
      setFormalizationPanel(null);
    } catch (updateError) {
      await enqueueSnackbar({
        message:
          updateError instanceof Error
            ? updateError.message
            : t('Não foi possível concluir a próxima ação. Tente novamente.'),
        variant: 'error',
      });
    } finally {
      setIsUpdatingNextAction(false);
    }
  };

  const saveReschedule = async () => {
    if (
      !rescheduleValue ||
      Number.isNaN(rescheduleValue.getTime()) ||
      isUpdatingNextAction
    ) {
      return;
    }

    const dueAt = rescheduleValue.toISOString();

    setIsUpdatingNextAction(true);
    try {
      const task = await getOrCreateNextTask();
      await updateTask(task.id, { dueAt });

      setRecord((currentRecord) =>
        currentRecord
          ? {
              ...currentRecord,
              tasks: currentRecord.tasks.map((currentTask) =>
                currentTask.id === task.id
                  ? { ...currentTask, dueAt }
                  : currentTask,
              ),
            }
          : currentRecord,
      );
      setRescheduleValue(null);
      await storeRescheduleHistory({
        taskTitle: task.title,
        previousDueAt: task.dueAt,
        dueAt,
      });
    } catch (updateError) {
      await enqueueSnackbar({
        message:
          updateError instanceof Error
            ? updateError.message
            : t('Não foi possível reagendar a próxima ação. Tente novamente.'),
        variant: 'error',
      });
    } finally {
      setIsUpdatingNextAction(false);
    }
  };

  if (!opportunityId || loading) {
    return null;
  }

  if (error || !record) {
    return (
      <div style={styles.shell}>
        <span style={styles.empty}>Não foi possível carregar o status.</span>
      </div>
    );
  }

  const currentPending = record.eventCurrentPending?.trim();
  const legacyNextAction = record.eventNextAction?.trim();
  const nextTask = legacyNextAction
    ? getNextOpenTaskWithTitle(record.tasks, legacyNextAction)
    : getNextOpenTask(record.tasks);
  const canCreateLegacyTask =
    legacyNextAction !== undefined &&
    legacyNextAction !== '' &&
    !hasLinkedTaskWithTitle(record.tasks, legacyNextAction);
  const nextActionTitle =
    nextTask?.title?.trim() ||
    (canCreateLegacyTask ? legacyNextAction : undefined);
  const nextActionAt =
    nextTask?.dueAt ?? (canCreateLegacyTask ? record.eventNextActionAt : null);

  return (
    <div style={styles.shell}>
      <div style={styles.section}>
        <span style={styles.fieldLabel}>Funil GSH</span>
        <Stepper currentValue={record.eventProcessStage} />
      </div>
      <div style={styles.row}>
        <span style={styles.fieldLabel}>Situação atual</span>
        <SituationChip value={record.eventCurrentSituation} />
      </div>
      <div style={styles.nextAction}>
        <span style={styles.fieldLabel}>Próxima ação</span>
        {nextActionTitle ? (
          <>
            <div style={styles.nextActionDetails}>
              <span style={styles.nextActionTitle}>{nextActionTitle}</span>
              <span style={styles.nextActionDate}>
                {formatDateTime(nextActionAt)}
              </span>
            </div>
            {rescheduleValue === null && formalizationPanel === null ? (
              <div style={styles.actionControls}>
                <button
                  type="button"
                  style={{ ...styles.actionButton, ...styles.completeButton }}
                  onClick={() => void completeNextAction()}
                  disabled={isUpdatingNextAction}
                >
                  {isUpdatingNextAction ? (
                    <Trans>Salvando…</Trans>
                  ) : (
                    <Trans>Concluir</Trans>
                  )}
                </button>
                <button
                  type="button"
                  style={styles.actionButton}
                  onClick={() => {
                    const selectedDate = nextActionAt
                      ? new Date(nextActionAt)
                      : new Date();
                    setRescheduleValue(
                      Number.isNaN(selectedDate.getTime())
                        ? new Date()
                        : selectedDate,
                    );
                  }}
                  disabled={isUpdatingNextAction}
                >
                  <Trans>Reagendar</Trans>
                </button>
              </div>
            ) : formalizationPanel ? (
              <div style={styles.rescheduleControls}>
                <label style={styles.fieldLabel}>
                  {formalizationPanel.label}
                  <select
                    style={styles.inlineSelect}
                    value={formalizationPanel.value}
                    onChange={(event) =>
                      setFormalizationPanel((currentPanel) =>
                        currentPanel
                          ? { ...currentPanel, value: event.target.value }
                          : currentPanel,
                      )
                    }
                    disabled={isUpdatingNextAction}
                  >
                    {formalizationPanel.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <div style={styles.actionControls}>
                  <button
                    type="button"
                    style={styles.actionButton}
                    onClick={() => void saveFormalizationStatus()}
                    disabled={isUpdatingNextAction}
                  >
                    {isUpdatingNextAction ? (
                      <Trans>Salvando…</Trans>
                    ) : (
                      <Trans>Salvar</Trans>
                    )}
                  </button>
                  <button
                    type="button"
                    style={styles.actionButton}
                    onClick={() => setFormalizationPanel(null)}
                    disabled={isUpdatingNextAction}
                  >
                    <Trans>Cancelar</Trans>
                  </button>
                </div>
              </div>
            ) : (
              <div style={styles.rescheduleControls}>
                <DatePicker
                  selected={rescheduleValue}
                  onChange={(date: Date | null) => setRescheduleValue(date)}
                  inline
                  locale="pt-BR"
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  timeCaption="Horário"
                  dateFormat="dd/MM/yyyy, HH:mm"
                  calendarClassName="gsh-reschedule-calendar"
                  disabled={isUpdatingNextAction}
                />
                <div style={styles.actionControls}>
                  <button
                    type="button"
                    style={styles.actionButton}
                    onClick={() => void saveReschedule()}
                    disabled={isUpdatingNextAction || !rescheduleValue}
                  >
                    {isUpdatingNextAction ? (
                      <Trans>Salvando…</Trans>
                    ) : (
                      <Trans>Salvar</Trans>
                    )}
                  </button>
                  <button
                    type="button"
                    style={styles.actionButton}
                    onClick={() => setRescheduleValue(null)}
                    disabled={isUpdatingNextAction}
                  >
                    <Trans>Cancelar</Trans>
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <span style={styles.empty}>Sem próxima ação registrada</span>
        )}
      </div>
      {currentPending ? (
        <div style={styles.pendingAlert} role="alert">
          <div style={styles.pendingContent}>
            <span style={styles.fieldLabel}>
              <Trans>Pendência atual</Trans>
            </span>
            <span style={styles.pendingText}>{currentPending}</span>
          </div>
          <button
            type="button"
            style={styles.resolveButton}
            onClick={() => void resolveCurrentPending()}
            disabled={isResolvingPending}
          >
            {isResolvingPending ? (
              <Trans>Resolvendo…</Trans>
            ) : (
              <Trans>Resolver</Trans>
            )}
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: STATUS_NOW_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'status-now',
  description:
    'Stepper do funil GSH e chip de situação atual no topo do registro de Opportunity.',
  component: StatusNow,
});
