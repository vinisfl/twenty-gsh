import type { CoreApiClient } from 'twenty-client-sdk/core';

import { PROPOSAL_STATUS } from 'src/constants/domain-options';
import {
  GSH_PROPOSAL_FOLLOWUP_TASK_TITLE,
} from 'src/constants/gsh-task-titles';
import { toCurrency } from 'src/logic-functions/utils/to-currency.util';

const PROPOSAL_FOLLOWUP_DUE_DAYS = 1;

type TaskCompletionClient = Pick<CoreApiClient, 'mutation'>;

type CreatedTask = {
  id: string;
  title: string;
  dueAt: string;
  status: 'TODO';
  position: null;
};

const requireMutationRecord = (
  response: unknown,
  mutationName: string,
  errorMessage: string,
): { id: string } => {
  const record = (response as Record<string, { id?: string } | undefined>)[
    mutationName
  ];

  if (!record?.id) {
    throw new Error(errorMessage);
  }

  return { id: record.id };
};

export const completeProposalTask = async ({
  client,
  opportunityId,
  proposalId,
  taskId,
  sentAt,
  assigneeId,
  now = new Date(),
}: {
  client: TaskCompletionClient;
  opportunityId: string;
  proposalId: string;
  taskId: string;
  sentAt: string;
  assigneeId: string | null;
  now?: Date;
}): Promise<CreatedTask> => {
  const proposalResponse = await client.mutation({
    updateEventProposal: {
      __args: {
        id: proposalId,
        data: { status: PROPOSAL_STATUS.SENT, sentAt },
      },
      id: true,
    },
  } as never);
  requireMutationRecord(
    proposalResponse,
    'updateEventProposal',
    'Não foi possível atualizar a proposta.',
  );

  const taskResponse = await client.mutation({
    updateTask: {
      __args: { id: taskId, data: { status: 'DONE' } },
      id: true,
    },
  });
  requireMutationRecord(
    taskResponse,
    'updateTask',
    'Não foi possível concluir a tarefa.',
  );

  const dueAt = new Date(
    now.getTime() + PROPOSAL_FOLLOWUP_DUE_DAYS * 24 * 60 * 60 * 1_000,
  ).toISOString();
  const followUpResponse = await client.mutation({
    createTask: {
      __args: {
        data: {
          title: GSH_PROPOSAL_FOLLOWUP_TASK_TITLE,
          dueAt,
          status: 'TODO',
          assigneeId,
        },
      },
      id: true,
    },
  });
  const followUpTask = requireMutationRecord(
    followUpResponse,
    'createTask',
    'Não foi possível criar o follow-up da proposta.',
  );

  const targetResponse = await client.mutation({
    createTaskTarget: {
      __args: {
        data: { taskId: followUpTask.id, targetOpportunityId: opportunityId },
      },
      id: true,
    },
  });
  requireMutationRecord(
    targetResponse,
    'createTaskTarget',
    'Não foi possível vincular o follow-up à oportunidade.',
  );

  return {
    id: followUpTask.id,
    title: GSH_PROPOSAL_FOLLOWUP_TASK_TITLE,
    dueAt,
    status: 'TODO',
    position: null,
  };
};

export const completeRegistrationRequestTask = async ({
  client,
  opportunityId,
  proposalId,
  taskId,
  closedAmountBRL,
  acceptanceEvidence,
}: {
  client: TaskCompletionClient;
  opportunityId: string;
  proposalId: string;
  taskId: string;
  closedAmountBRL: number;
  acceptanceEvidence: string;
}): Promise<void> => {
  const proposalResponse = await client.mutation({
    updateEventProposal: {
      __args: {
        id: proposalId,
        data: { status: PROPOSAL_STATUS.ACCEPTED },
      },
      id: true,
    },
  } as never);
  requireMutationRecord(
    proposalResponse,
    'updateEventProposal',
    'Não foi possível atualizar a proposta.',
  );

  const opportunityResponse = await client.mutation({
    updateOpportunity: {
      __args: {
        id: opportunityId,
        data: {
          eventClosedAmount: toCurrency(closedAmountBRL),
          eventAcceptanceEvidence: acceptanceEvidence,
        },
      },
      id: true,
    },
  } as never);
  requireMutationRecord(
    opportunityResponse,
    'updateOpportunity',
    'Não foi possível atualizar a oportunidade.',
  );

  const taskResponse = await client.mutation({
    updateTask: {
      __args: { id: taskId, data: { status: 'DONE' } },
      id: true,
    },
  });
  requireMutationRecord(
    taskResponse,
    'updateTask',
    'Não foi possível concluir a tarefa.',
  );
};
