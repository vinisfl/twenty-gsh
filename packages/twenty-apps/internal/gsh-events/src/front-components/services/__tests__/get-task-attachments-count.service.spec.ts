import { describe, expect, it, vi } from 'vitest';
import type { CoreApiClient } from 'twenty-client-sdk/core';

import { getTaskAttachmentsCount } from 'src/front-components/services/get-task-attachments-count.service';

describe('getTaskAttachmentsCount', () => {
  it('queries the task by id and returns its attachments total count', async () => {
    const query = vi.fn().mockResolvedValue({
      task: { attachments: { totalCount: 2 } },
    });
    const client = { query } as unknown as CoreApiClient;

    const count = await getTaskAttachmentsCount(client, 'task-id');

    expect(count).toBe(2);
    expect(query.mock.calls[0][0].task.__args).toEqual({
      filter: { id: { eq: 'task-id' } },
    });
  });

  it('returns 0 when the task has no attachments', async () => {
    const query = vi.fn().mockResolvedValue({
      task: { attachments: { totalCount: 0 } },
    });
    const client = { query } as unknown as CoreApiClient;

    expect(await getTaskAttachmentsCount(client, 'task-id')).toBe(0);
  });

  it('returns 0 when the task cannot be found', async () => {
    const query = vi.fn().mockResolvedValue({ task: null });
    const client = { query } as unknown as CoreApiClient;

    expect(await getTaskAttachmentsCount(client, 'missing-task-id')).toBe(0);
  });
});
