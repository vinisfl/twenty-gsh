export type LinkedTask = {
  id: string;
  title: string | null;
  dueAt: string | null;
  status: string | null;
};

const dueAtSortValue = (dueAt: string | null): number => {
  if (!dueAt) {
    return Number.POSITIVE_INFINITY;
  }

  const timestamp = new Date(dueAt).getTime();

  return Number.isNaN(timestamp) ? Number.POSITIVE_INFINITY : timestamp;
};

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
    .sort((left, right) => dueAtSortValue(left.dueAt) - dueAtSortValue(right.dueAt))[0];

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
