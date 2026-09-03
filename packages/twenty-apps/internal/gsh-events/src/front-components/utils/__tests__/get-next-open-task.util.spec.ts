import { describe, expect, it } from 'vitest';
import {
  getNextOpenTask,
  getNextOpenTaskWithTitle,
  hasLinkedTaskWithTitle,
} from 'src/front-components/utils/get-next-open-task.util';

describe('getNextOpenTask', () => {
  it('returns the earliest due task that has not been completed', () => {
    expect(
      getNextOpenTask([
        {
          id: 'done',
          title: 'Already done',
          dueAt: '2026-09-03T09:00:00.000Z',
          status: 'DONE',
        },
        {
          id: 'later',
          title: 'Later task',
          dueAt: '2026-09-04T09:00:00.000Z',
          status: 'TODO',
        },
        {
          id: 'next',
          title: 'Next task',
          dueAt: '2026-09-03T10:00:00.000Z',
          status: 'IN_PROGRESS',
        },
      ]),
    ).toMatchObject({ id: 'next' });
  });

  it('keeps undated tasks after dated tasks and returns undefined without open tasks', () => {
    expect(
      getNextOpenTask([
        { id: 'undated', title: 'Undated', dueAt: null, status: 'TODO' },
        {
          id: 'dated',
          title: 'Dated',
          dueAt: '2026-09-05T09:00:00.000Z',
          status: 'TODO',
        },
      ]),
    ).toMatchObject({ id: 'dated' });
    expect(
      getNextOpenTask([
        { id: 'done', title: 'Done', dueAt: null, status: 'DONE' },
      ]),
    ).toBeUndefined();
  });

  it('only matches a legacy action to a linked task with the same title', () => {
    const tasks = [
      {
        id: 'unrelated',
        title: 'Send proposal',
        dueAt: '2026-09-03T09:00:00.000Z',
        status: 'TODO',
      },
      {
        id: 'matching',
        title: 'Call client',
        dueAt: '2026-09-04T09:00:00.000Z',
        status: 'TODO',
      },
    ];

    expect(getNextOpenTaskWithTitle(tasks, ' call client ')).toMatchObject({
      id: 'matching',
    });
    expect(getNextOpenTaskWithTitle(tasks, 'Arrange tasting')).toBeUndefined();
    expect(hasLinkedTaskWithTitle(tasks, 'CALL CLIENT')).toBe(true);
  });
});
