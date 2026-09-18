import type { CoreApiClient } from 'twenty-client-sdk/core';

import { GSH_QUALIFICATION_TASK_TITLES } from 'src/constants/gsh-task-titles';

type TaskCompletionClient = Pick<CoreApiClient, 'mutation'>;

export type CreatedQualificationTask = {
  id: string;
  title: string;
  dueAt: null;
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

// Create the follow-up tasks before resolving the initial-contact task. If a
// creation fails, the initial task remains open and the seller can retry.
export const completeInitialContactTask = async ({
  client,
  opportunityId,
  taskId,
  assigneeId,
  existingTaskTitles = [],
}: {
  client: TaskCompletionClient;
  opportunityId: string;
  taskId: string;
  assigneeId: string | null;
  existingTaskTitles?: Array<string | null>;
}): Promise<CreatedQualificationTask[]> => {
  const qualificationTasks: CreatedQualificationTask[] = [];
  const existingTitles = new Set(
    existingTaskTitles
      .filter((title): title is string => title !== null)
      .map((title) => title.trim().toLocaleLowerCase()),
  );

  for (const title of GSH_QUALIFICATION_TASK_TITLES) {
    if (existingTitles.has(title.toLocaleLowerCase())) {
      continue;
    }

    const taskResponse = await client.mutation({
      createTask: {
        __args: {
          data: { title, dueAt: null, status: 'TODO', assigneeId },
        },
        id: true,
      },
    });
    const task = requireMutationRecord(
      taskResponse,
      'createTask',
      'Não foi possível criar a tarefa de qualificação.',
    );

    try {
      const targetResponse = await client.mutation({
        createTaskTarget: {
          __args: {
            data: { taskId: task.id, targetOpportunityId: opportunityId },
          },
          id: true,
        },
      });
      requireMutationRecord(
        targetResponse,
        'createTaskTarget',
        'Não foi possível vincular a tarefa de qualificação à oportunidade.',
      );
    } catch (error) {
      // An unlinked task cannot be found on retry through the opportunity's
      // TaskTargets, so remove it before surfacing the failed link.
      await client.mutation({
        deleteTask: {
          __args: { id: task.id },
          id: true,
        },
      });
      throw error;
    }

    qualificationTasks.push({
      id: task.id,
      title,
      dueAt: null,
      status: 'TODO',
      position: null,
    });
  }

  const completionResponse = await client.mutation({
    updateTask: {
      __args: { id: taskId, data: { status: 'DONE' } },
      id: true,
    },
  });
  requireMutationRecord(
    completionResponse,
    'updateTask',
    'Não foi possível concluir a tarefa de contato inicial.',
  );

  return qualificationTasks;
};
