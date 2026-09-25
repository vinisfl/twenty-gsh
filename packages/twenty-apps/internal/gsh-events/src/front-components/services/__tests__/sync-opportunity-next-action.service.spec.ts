import { describe, expect, it, vi } from 'vitest';
import type { CoreApiClient } from 'twenty-client-sdk/core';

import { syncOpportunityNextAction } from 'src/front-components/services/sync-opportunity-next-action.service';
import type { LinkedTask } from 'src/front-components/utils/get-next-open-task.util';

const buildTask = (overrides: Partial<LinkedTask>): LinkedTask => ({
  id: 'task-id',
  title: 'Task title',
  dueAt: null,
  status: 'TODO',
  position: null,
  ...overrides,
});

describe('syncOpportunityNextAction', () => {
  it('persists the earliest open task title and due date onto the opportunity', async () => {
    const mutation = vi
      .fn()
      .mockResolvedValue({ updateOpportunity: { id: 'opportunity-id' } });
    const client = { mutation } as unknown as CoreApiClient;

    const result = await syncOpportunityNextAction({
      client,
      opportunityId: 'opportunity-id',
      tasks: [
        buildTask({
          id: 'later',
          title: 'Later task',
          dueAt: '2026-09-20T09:00:00.000Z',
        }),
        buildTask({
          id: 'next',
          title: 'Ligar para o cliente',
          dueAt: '2026-09-18T09:00:00.000Z',
        }),
        buildTask({ id: 'done', title: 'Done task', status: 'DONE' }),
      ],
    });

    expect(result).toEqual({
      eventNextAction: 'Ligar para o cliente',
      eventNextActionAt: '2026-09-18T09:00:00.000Z',
    });
    expect(mutation).toHaveBeenCalledWith({
      updateOpportunity: {
        __args: {
          id: 'opportunity-id',
          data: {
            eventNextAction: 'Ligar para o cliente',
            eventNextActionAt: '2026-09-18T09:00:00.000Z',
          },
        },
        id: true,
      },
    });
  });

  it('clears both fields when there is no open task left', async () => {
    const mutation = vi
      .fn()
      .mockResolvedValue({ updateOpportunity: { id: 'opportunity-id' } });
    const client = { mutation } as unknown as CoreApiClient;

    const result = await syncOpportunityNextAction({
      client,
      opportunityId: 'opportunity-id',
      tasks: [buildTask({ id: 'done', status: 'DONE' })],
    });

    expect(result).toEqual({
      eventNextAction: null,
      eventNextActionAt: null,
    });
    expect(mutation.mock.calls[0][0].updateOpportunity.__args.data).toEqual({
      eventNextAction: null,
      eventNextActionAt: null,
    });
  });

  it('throws when the mutation does not return an updated record', async () => {
    const mutation = vi.fn().mockResolvedValue({});
    const client = { mutation } as unknown as CoreApiClient;

    await expect(
      syncOpportunityNextAction({
        client,
        opportunityId: 'opportunity-id',
        tasks: [],
      }),
    ).rejects.toThrow(
      'Não foi possível sincronizar a próxima ação da oportunidade.',
    );
  });
});
