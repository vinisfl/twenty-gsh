import type { CoreApiClient } from 'twenty-client-sdk/core';

import {
  getNextOpenTask,
  type LinkedTask,
} from 'src/front-components/utils/get-next-open-task.util';

type SyncClient = Pick<CoreApiClient, 'mutation'>;

export type OpportunityNextActionSync = {
  eventNextAction: string | null;
  eventNextActionAt: string | null;
};

// The Kanban card's "Próxima ação" fields are plain text/date-time mirrors of
// whichever open Task is currently earliest for the Opportunity — every call
// site that changes which task holds that spot must call this so the mirror
// never goes stale (see issue #72).
export const syncOpportunityNextAction = async ({
  client,
  opportunityId,
  tasks,
}: {
  client: SyncClient;
  opportunityId: string;
  tasks: LinkedTask[];
}): Promise<OpportunityNextActionSync> => {
  const nextTask = getNextOpenTask(tasks);
  const nextActionSync: OpportunityNextActionSync = {
    eventNextAction: nextTask?.title?.trim() || null,
    eventNextActionAt: nextTask?.dueAt ?? null,
  };

  const result = (await client.mutation({
    updateOpportunity: {
      __args: { id: opportunityId, data: nextActionSync },
      id: true,
    },
  } as never)) as unknown as { updateOpportunity?: { id?: string } };

  if (!result.updateOpportunity?.id) {
    throw new Error(
      'Não foi possível sincronizar a próxima ação da oportunidade.',
    );
  }

  return nextActionSync;
};
