import type { CoreApiClient } from 'twenty-client-sdk/core';

type AttachmentsCountClient = Pick<CoreApiClient, 'query'>;

export const getTaskAttachmentsCount = async (
  client: AttachmentsCountClient,
  taskId: string,
): Promise<number> => {
  const result = (await client.query({
    task: {
      __args: { filter: { id: { eq: taskId } } },
      attachments: { totalCount: true },
    },
  } as never)) as unknown as {
    task?: { attachments?: { totalCount?: number | null } | null } | null;
  };

  return result.task?.attachments?.totalCount ?? 0;
};
