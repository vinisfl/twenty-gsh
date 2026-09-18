import { describe, expect, it, vi } from 'vitest';
import type { CoreApiClient } from 'twenty-client-sdk/core';

import { completeInitialContactTask } from 'src/front-components/services/complete-initial-contact-task.service';

const getOperationNames = (mutation: ReturnType<typeof vi.fn>) =>
  mutation.mock.calls.map(([operation]) => Object.keys(operation)[0]);

describe('initial-contact task completion', () => {
  it('creates and links the five undated qualification tasks for the deal owner before completing the initial-contact task', async () => {
    let taskNumber = 0;
    const mutation = vi
      .fn()
      .mockImplementation(async (operation: Record<string, unknown>) => {
        if ('createTask' in operation) {
          taskNumber += 1;
          return { createTask: { id: `qualification-task-${taskNumber}` } };
        }

        if ('createTaskTarget' in operation) {
          return { createTaskTarget: { id: 'task-target-id' } };
        }

        return { updateTask: { id: 'initial-contact-task-id' } };
      });
    const client = { mutation } as unknown as CoreApiClient;

    const tasks = await completeInitialContactTask({
      client,
      opportunityId: 'opportunity-id',
      taskId: 'initial-contact-task-id',
      assigneeId: 'owner-id',
    });

    expect(getOperationNames(mutation)).toEqual([
      'createTask',
      'createTaskTarget',
      'createTask',
      'createTaskTarget',
      'createTask',
      'createTaskTarget',
      'createTask',
      'createTaskTarget',
      'createTask',
      'createTaskTarget',
      'updateTask',
    ]);
    expect(tasks.map((task) => task.title)).toEqual([
      'Coletar tipo de evento',
      'Coletar público estimado',
      'Coletar local/cidade',
      'Coletar data do evento',
      'Coletar valor estimado',
    ]);
    expect(mutation.mock.calls[0][0].createTask.__args.data).toEqual({
      title: 'Coletar tipo de evento',
      dueAt: null,
      status: 'TODO',
      assigneeId: 'owner-id',
    });
    expect(mutation.mock.calls[9][0].createTaskTarget.__args.data).toEqual({
      taskId: 'qualification-task-5',
      targetOpportunityId: 'opportunity-id',
    });
    expect(mutation.mock.calls[10][0].updateTask.__args.data).toEqual({
      status: 'DONE',
    });
  });

  it('does not recreate qualification tasks that already exist after a retry', async () => {
    const mutation = vi.fn().mockResolvedValue({
      updateTask: { id: 'initial-contact-task-id' },
    });
    const client = { mutation } as unknown as CoreApiClient;

    const tasks = await completeInitialContactTask({
      client,
      opportunityId: 'opportunity-id',
      taskId: 'initial-contact-task-id',
      assigneeId: 'owner-id',
      existingTaskTitles: [
        'Coletar tipo de evento',
        'Coletar público estimado',
        'Coletar local/cidade',
        'Coletar data do evento',
        'Coletar valor estimado',
      ],
    });

    expect(tasks).toEqual([]);
    expect(getOperationNames(mutation)).toEqual(['updateTask']);
  });

  it('removes a created task if it cannot be linked to the opportunity', async () => {
    const mutation = vi
      .fn()
      .mockImplementation(async (operation: Record<string, unknown>) => {
        if ('createTask' in operation) {
          return { createTask: { id: 'qualification-task-id' } };
        }

        if ('createTaskTarget' in operation) {
          return { createTaskTarget: null };
        }

        return { deleteTask: { id: 'qualification-task-id' } };
      });
    const client = { mutation } as unknown as CoreApiClient;

    await expect(
      completeInitialContactTask({
        client,
        opportunityId: 'opportunity-id',
        taskId: 'initial-contact-task-id',
        assigneeId: 'owner-id',
      }),
    ).rejects.toThrow('Não foi possível vincular a tarefa de qualificação');

    expect(getOperationNames(mutation)).toEqual([
      'createTask',
      'createTaskTarget',
      'deleteTask',
    ]);
    expect(mutation.mock.calls[2][0].deleteTask.__args).toEqual({
      id: 'qualification-task-id',
    });
  });
});
