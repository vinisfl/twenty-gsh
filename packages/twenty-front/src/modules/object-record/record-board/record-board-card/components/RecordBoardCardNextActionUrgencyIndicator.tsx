import { useLingui } from '@lingui/react/macro';
import { styled } from '@linaria/react';
import { useContext } from 'react';
import {
  IconAlertCircle,
  IconCalendar,
  IconCalendarDue,
  IconCalendarX,
  IconCircleDashed,
} from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { RecordBoardCardContext } from '@/object-record/record-board/record-board-card/contexts/RecordBoardCardContext';
import {
  getKanbanNextActionUrgency,
  type KanbanNextActionUrgency,
} from '@/object-record/record-board/record-board-card/utils/getKanbanNextActionUrgency';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

const StyledUrgencyIndicator = styled.div<{
  urgency: KanbanNextActionUrgency;
}>`
  align-items: center;
  color: ${({ urgency }) => {
    if (urgency === 'OVERDUE' || urgency === 'NO_NEXT_ACTION') {
      return themeCssVariables.color.red;
    }

    if (urgency === 'TODAY' || urgency === 'NO_DUE_DATE') {
      return themeCssVariables.color.orange;
    }

    return themeCssVariables.font.color.tertiary;
  }};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
  padding: 0 ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[2]};
`;

export const RecordBoardCardNextActionUrgencyIndicator = () => {
  const { t } = useLingui();
  const { recordId } = useContext(RecordBoardCardContext);
  const recordStore = useAtomFamilyStateValue(recordStoreFamilyState, recordId);

  if (
    !recordStore ||
    !('eventNextAction' in recordStore) ||
    !('eventNextActionAt' in recordStore)
  ) {
    return null;
  }

  const urgency = getKanbanNextActionUrgency({
    nextAction: recordStore.eventNextAction,
    nextActionAt: recordStore.eventNextActionAt,
  });
  const Icon =
    urgency === 'OVERDUE'
      ? IconAlertCircle
      : urgency === 'TODAY'
        ? IconCalendarDue
        : urgency === 'NO_NEXT_ACTION'
          ? IconCircleDashed
          : urgency === 'NO_DUE_DATE'
            ? IconCalendarX
            : IconCalendar;
  const label =
    urgency === 'OVERDUE'
      ? t`Atrasada`
      : urgency === 'TODAY'
        ? t`Hoje`
        : urgency === 'NO_NEXT_ACTION'
          ? t`Sem próxima ação`
          : urgency === 'NO_DUE_DATE'
            ? t`Sem prazo`
            : t`Agendada`;

  return (
    <StyledUrgencyIndicator aria-label={label} urgency={urgency}>
      <Icon />
      {label}
    </StyledUrgencyIndicator>
  );
};
