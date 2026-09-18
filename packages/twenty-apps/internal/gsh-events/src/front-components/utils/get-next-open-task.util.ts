export type LinkedTask = {
  id: string;
  title: string | null;
  dueAt: string | null;
  status: string | null;
  position: number | null;
};

const dueAtSortValue = (dueAt: string | null): number => {
  if (!dueAt) {
    return Number.POSITIVE_INFINITY;
  }

  const timestamp = new Date(dueAt).getTime();

  return Number.isNaN(timestamp) ? Number.POSITIVE_INFINITY : timestamp;
};

// GSH-specific: several tasks in the formalization chain (see
// getFormalizationChainPrerequisites in twenty-front) are created without a
// dueAt, so dueAtSortValue alone leaves them tied. `position` (Twenty's
// native ordering field, set on creation) breaks that tie deterministically.
const positionSortValue = (position: number | null): number =>
  position === null ? Number.POSITIVE_INFINITY : position;

const normalizeTaskTitle = (title: string): string =>
  title.trim().replace(/\s+/g, ' ').toLocaleLowerCase();

export const hasLinkedTaskWithTitle = (
  tasks: LinkedTask[],
  title: string,
): boolean =>
  tasks.some(
    (task) =>
      task.title !== null &&
      normalizeTaskTitle(task.title) === normalizeTaskTitle(title),
  );

export const getNextOpenTask = (
  tasks: LinkedTask[],
): LinkedTask | undefined =>
  tasks
    .filter((task) => task.status !== 'DONE')
    .sort((left, right) => {
      const leftDueAt = dueAtSortValue(left.dueAt);
      const rightDueAt = dueAtSortValue(right.dueAt);

      // Both infinite (no valid dueAt) would subtract to NaN, so compare by
      // equality first rather than relying on a zero difference.
      return leftDueAt !== rightDueAt
        ? leftDueAt - rightDueAt
        : positionSortValue(left.position) - positionSortValue(right.position);
    })[0];

export const getNextOpenTaskWithTitle = (
  tasks: LinkedTask[],
  title: string,
): LinkedTask | undefined =>
  getNextOpenTask(
    tasks.filter(
      (task) =>
        task.title !== null &&
        normalizeTaskTitle(task.title) === normalizeTaskTitle(title),
    ),
  );

// A task resolved from the legacy text-only next-action field may have just
// been created and not be in `tasks` yet (that only lands once the caller's
// state update commits) — without this, syncing against `tasks` as-is would
// silently drop it.
export const withResolvedTask = (
  tasks: LinkedTask[],
  task: LinkedTask,
): LinkedTask[] =>
  tasks.some((existingTask) => existingTask.id === task.id)
    ? tasks
    : [...tasks, task];
