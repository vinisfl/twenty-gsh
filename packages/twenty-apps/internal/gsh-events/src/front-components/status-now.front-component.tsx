import { Fragment, type CSSProperties, useCallback, useEffect, useState } from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineFrontComponent } from 'twenty-sdk/define';
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
import { fromDateTimeLocalValue } from 'src/front-components/utils/from-date-time-local-value.util';
import { toDateTimeLocalValue } from 'src/front-components/utils/to-date-time-local-value.util';
import { EVENT_CURRENT_SITUATION_OPTIONS } from 'src/fields/opportunity-current-situation.field';
import { EVENT_PROCESS_STAGE_OPTIONS } from 'src/fields/opportunity-process-stage.field';

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
  stepperColumn: { display: 'flex', flexDirection: 'column', gap: theme.spacing1 },
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
  completeButton: {
    borderColor: 'var(--t-tag-text-green)',
    color: 'var(--t-tag-text-green)',
  },
  dateTimeInput: {
    minWidth: '190px',
    padding: theme.spacing1,
    border: `1px solid ${theme.border}`,
    borderRadius: 'var(--t-border-radius-sm)',
    background: theme.backgroundPrimary,
    color: theme.fontPrimary,
    fontFamily: theme.fontFamily,
    fontSize: theme.sizeXs,
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
          color: currentStep ? `var(--t-tag-text-${currentStep.color})` : theme.fontTertiary,
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
  tasks: LinkedTask[];
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
  const opportunityId = useFrontComponentExecutionContext((context) =>
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
  const [rescheduleValue, setRescheduleValue] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!opportunityId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(false);
    try {
      const result = await new CoreApiClient().query({
        opportunity: {
          __args: { filter: { id: { eq: opportunityId } } },
          eventProcessStage: true,
          eventCurrentSituation: true,
          eventCurrentPending: true,
          eventNextAction: true,
          eventNextActionAt: true,
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
              },
            },
          },
        },
      });

      const found = result?.opportunity;
      const tasks: LinkedTask[] = [];
      for (const { node } of result?.taskTargets?.edges ?? []) {
        const task = node.task;
        if (task?.id) {
          tasks.push({
            id: task.id,
            title: task.title ?? null,
            dueAt: task.dueAt ?? null,
            status: task.status ?? null,
          });
        }
      }
      setRecord({
        eventProcessStage: found?.eventProcessStage ?? null,
        eventCurrentSituation: found?.eventCurrentSituation ?? null,
        eventCurrentPending: found?.eventCurrentPending ?? null,
        eventNextAction: found?.eventNextAction ?? null,
        eventNextActionAt: found?.eventNextActionAt ?? null,
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
      throw new Error('Opportunity not found');
    }

    const client = new CoreApiClient();
    const taskResult = await client.mutation({
      createTask: {
        __args: { data: { title, dueAt, status: 'TODO' } },
        id: true,
        title: true,
        dueAt: true,
        status: true,
      },
    });
    const task = taskResult.createTask as LinkedTask | undefined;

    if (!task?.id) {
      throw new Error('Task creation did not return a record');
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
      throw new Error('Task link creation did not return a record');
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
      throw new Error('Não existe uma próxima ação para atualizar.');
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
      throw new Error('Task update did not return a record');
    }
  };

  const completeNextAction = async () => {
    if (isUpdatingNextAction) {
      return;
    }

    setIsUpdatingNextAction(true);
    try {
      const task = await getOrCreateNextTask();
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

  const saveReschedule = async () => {
    if (!rescheduleValue || isUpdatingNextAction) {
      return;
    }

    const dueAt = fromDateTimeLocalValue(rescheduleValue);

    if (!dueAt) {
      return;
    }

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
    nextTask?.dueAt ??
    (canCreateLegacyTask ? record.eventNextActionAt : null);

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
              <span style={styles.nextActionDate}>{formatDateTime(nextActionAt)}</span>
            </div>
            {rescheduleValue === null ? (
              <div style={styles.actionControls}>
                <button
                  type="button"
                  style={{ ...styles.actionButton, ...styles.completeButton }}
                  onClick={() => void completeNextAction()}
                  disabled={isUpdatingNextAction}
                >
                  {isUpdatingNextAction ? <Trans>Salvando…</Trans> : <Trans>Concluir</Trans>}
                </button>
                <button
                  type="button"
                  style={styles.actionButton}
                  onClick={() =>
                    setRescheduleValue(
                      toDateTimeLocalValue(nextActionAt ?? new Date().toISOString()),
                    )
                  }
                  disabled={isUpdatingNextAction}
                >
                  <Trans>Reagendar</Trans>
                </button>
              </div>
            ) : (
              <div style={styles.actionControls}>
                <input
                  type="datetime-local"
                  aria-label="Nova data e hora da próxima ação"
                  style={styles.dateTimeInput}
                  value={rescheduleValue}
                  onChange={(event) => setRescheduleValue(event.target.value)}
                  disabled={isUpdatingNextAction}
                />
                <button
                  type="button"
                  style={styles.actionButton}
                  onClick={() => void saveReschedule()}
                  disabled={isUpdatingNextAction || !rescheduleValue}
                >
                  {isUpdatingNextAction ? <Trans>Salvando…</Trans> : <Trans>Salvar</Trans>}
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
            {isResolvingPending ? <Trans>Resolvendo…</Trans> : <Trans>Resolver</Trans>}
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
