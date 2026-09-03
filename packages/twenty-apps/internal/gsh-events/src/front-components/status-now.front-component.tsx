import { type CSSProperties, useCallback, useEffect, useState } from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineFrontComponent } from 'twenty-sdk/define';
import { useFrontComponentExecutionContext } from 'twenty-sdk/front-component';

import { STATUS_NOW_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import {
  getStepStatus,
  type StepStatus,
} from 'src/front-components/utils/get-step-status.util';
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
  stepper: { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0 },
  step: { display: 'flex', alignItems: 'center' },
  connector: { width: '20px', height: '2px', flexShrink: 0 },
  empty: { color: theme.fontTertiary, fontSize: theme.sizeXs },
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

const Stepper = ({ currentValue }: { currentValue: string | null }) => {
  const currentIndex = FUNNEL_STEPS.findIndex(
    (step) => step.value === currentValue,
  );

  return (
    <div style={styles.stepper}>
      {FUNNEL_STEPS.map((step, index) => {
        const status = getStepStatus(index, currentIndex);
        return (
          <div key={step.value} style={styles.step}>
            <span style={chipStyle(step.color, status)}>
              {status === 'completed' ? '✓ ' : ''}
              {step.label}
            </span>
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
          </div>
        );
      })}
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
};

const StatusNow = () => {
  const opportunityId = useFrontComponentExecutionContext((context) =>
    context.recordId ??
    (context.selectedRecordIds.length === 1
      ? context.selectedRecordIds[0]
      : null),
  );
  const [record, setRecord] = useState<OpportunityStatusRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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
        },
      });

      const found = result?.opportunity;
      setRecord({
        eventProcessStage: found?.eventProcessStage ?? null,
        eventCurrentSituation: found?.eventCurrentSituation ?? null,
      });
    } catch {
      setError(true);
    }
    setLoading(false);
  }, [opportunityId]);

  useEffect(() => {
    void load();
  }, [load]);

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

  return (
    <div style={styles.shell}>
      <div style={styles.row}>
        <span style={styles.fieldLabel}>Funil GSH</span>
        <Stepper currentValue={record.eventProcessStage} />
      </div>
      <div style={styles.row}>
        <span style={styles.fieldLabel}>Situação atual</span>
        <SituationChip value={record.eventCurrentSituation} />
      </div>
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
