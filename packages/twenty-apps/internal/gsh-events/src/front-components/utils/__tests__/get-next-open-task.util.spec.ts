import { describe, expect, it } from 'vitest';
import {
  getNextOpenTask,
  getNextOpenTaskWithTitle,
  hasLinkedTaskWithTitle,
  withResolvedTask,
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
          position: 1,
        },
        {
          id: 'later',
          title: 'Later task',
          dueAt: '2026-09-04T09:00:00.000Z',
          status: 'TODO',
          position: 2,
        },
        {
          id: 'next',
          title: 'Next task',
          dueAt: '2026-09-03T10:00:00.000Z',
          status: 'IN_PROGRESS',
          position: 3,
        },
      ]),
    ).toMatchObject({ id: 'next' });
  });

  it('keeps undated tasks after dated tasks and returns undefined without open tasks', () => {
    expect(
      getNextOpenTask([
        {
          id: 'undated',
          title: 'Undated',
          dueAt: null,
          status: 'TODO',
          position: 1,
        },
        {
          id: 'dated',
          title: 'Dated',
          dueAt: '2026-09-05T09:00:00.000Z',
          status: 'TODO',
          position: 2,
        },
      ]),
    ).toMatchObject({ id: 'dated' });
    expect(
      getNextOpenTask([
        { id: 'done', title: 'Done', dueAt: null, status: 'DONE', position: 1 },
      ]),
    ).toBeUndefined();
  });

  it('breaks ties between undated TODO tasks by position', () => {
    expect(
      getNextOpenTask([
        {
          id: 'second',
          title: 'Preencher Formulário de Compra',
          dueAt: null,
          status: 'TODO',
          position: 2,
        },
        {
          id: 'first',
          title: 'Gerar Ordem de Serviço',
          dueAt: null,
          status: 'TODO',
          position: 1,
        },
        {
          id: 'third',
          title: 'Acompanhar emissão de NF junto ao financeiro',
          dueAt: null,
          status: 'TODO',
          position: 3,
        },
      ]),
    ).toMatchObject({ id: 'first' });
  });

  it('places undated tasks without a position last among undated tasks', () => {
    expect(
      getNextOpenTask([
        {
          id: 'no-position',
          title: 'No position',
          dueAt: null,
          status: 'TODO',
          position: null,
        },
        {
          id: 'has-position',
          title: 'Has position',
          dueAt: null,
          status: 'TODO',
          position: 1,
        },
      ]),
    ).toMatchObject({ id: 'has-position' });
  });

  it('only matches a legacy action to a linked task with the same title', () => {
    const tasks = [
      {
        id: 'unrelated',
        title: 'Send proposal',
        dueAt: '2026-09-03T09:00:00.000Z',
        status: 'TODO',
        position: 1,
      },
      {
        id: 'matching',
        title: 'Call client',
        dueAt: '2026-09-04T09:00:00.000Z',
        status: 'TODO',
        position: 2,
      },
    ];

    expect(getNextOpenTaskWithTitle(tasks, ' call client ')).toMatchObject({
      id: 'matching',
    });
    expect(getNextOpenTaskWithTitle(tasks, 'Arrange tasting')).toBeUndefined();
    expect(hasLinkedTaskWithTitle(tasks, 'CALL CLIENT')).toBe(true);
  });
});

describe('withResolvedTask', () => {
  it('appends the task when it is not already in the list', () => {
    const existing = {
      id: 'existing',
      title: 'Existing task',
      dueAt: null,
      status: 'TODO',
      position: 1,
    };
    const resolved = {
      id: 'new',
      title: 'Enviar contato inicial',
      dueAt: '2026-09-18T09:00:00.000Z',
      status: 'TODO',
      position: null,
    };

    expect(withResolvedTask([existing], resolved)).toEqual([
      existing,
      resolved,
    ]);
  });

  it('leaves the list untouched when the task is already present', () => {
    const existing = {
      id: 'existing',
      title: 'Existing task',
      dueAt: null,
      status: 'TODO',
      position: 1,
    };

    expect(withResolvedTask([existing], existing)).toEqual([existing]);
  });
});
