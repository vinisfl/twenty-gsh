import { isBefore, isSameDay, isValid, startOfDay } from 'date-fns';

export type KanbanNextActionUrgency =
  | 'OVERDUE'
  | 'TODAY'
  | 'NO_NEXT_ACTION'
  | 'NO_DUE_DATE'
  | 'UPCOMING';

type GetKanbanNextActionUrgencyArgs = {
  nextAction: string | null | undefined;
  nextActionAt: string | null | undefined;
  now?: Date;
};

export const getKanbanNextActionUrgency = ({
  nextAction,
  nextActionAt,
  now = new Date(),
}: GetKanbanNextActionUrgencyArgs): KanbanNextActionUrgency => {
  if (!nextAction?.trim()) {
    return 'NO_NEXT_ACTION';
  }

  if (!nextActionAt) {
    return 'NO_DUE_DATE';
  }

  const dueDate = new Date(nextActionAt);

  if (!isValid(dueDate)) {
    return 'NO_DUE_DATE';
  }

  if (isBefore(startOfDay(dueDate), startOfDay(now))) {
    return 'OVERDUE';
  }

  if (isSameDay(dueDate, now)) {
    return 'TODAY';
  }

  return 'UPCOMING';
};
