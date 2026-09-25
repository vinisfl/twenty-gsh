import type { CoreApiClient } from 'twenty-client-sdk/core';

import {
  GSH_QUALIFICATION_AUDIENCE_TASK_TITLE,
  GSH_QUALIFICATION_ESTIMATED_AMOUNT_TASK_TITLE,
  GSH_QUALIFICATION_EVENT_DATE_TASK_TITLE,
  GSH_QUALIFICATION_EVENT_TYPE_TASK_TITLE,
  GSH_QUALIFICATION_LOCATION_CITY_TASK_TITLE,
} from 'src/constants/gsh-task-titles';
import { toCurrency } from 'src/logic-functions/utils/to-currency.util';

type TaskCompletionClient = Pick<CoreApiClient, 'mutation'>;

type QualificationValues = {
  eventType?: string;
  audience?: number;
  location?: string;
  city?: string;
  eventAt?: string;
  amount?: number;
};

export type QualificationTaskCompletion = {
  eventType?: string;
  eventAudience?: number;
  eventLocation?: string;
  eventAt?: string;
  amount?: { amountMicros: number; currencyCode: string };
  corporateEvent?: { id: string; city?: string };
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

const updateOpportunity = async (
  client: TaskCompletionClient,
  opportunityId: string,
  data: Record<string, unknown>,
) => {
  const response = await client.mutation({
    updateOpportunity: {
      __args: { id: opportunityId, data },
      id: true,
    },
  } as never);

  requireMutationRecord(
    response,
    'updateOpportunity',
    'Não foi possível atualizar a oportunidade.',
  );
};

const saveCorporateEvent = async ({
  client,
  corporateEventId,
  opportunityId,
  opportunityName,
  data,
}: {
  client: TaskCompletionClient;
  corporateEventId: string | null;
  opportunityId: string;
  opportunityName: string | null;
  data: Record<string, unknown>;
}): Promise<string> => {
  if (corporateEventId) {
    const response = await client.mutation({
      updateCorporateEvent: {
        __args: { id: corporateEventId, data },
        id: true,
      },
    } as never);

    return requireMutationRecord(
      response,
      'updateCorporateEvent',
      'Não foi possível atualizar o evento.',
    ).id;
  }

  const response = await client.mutation({
    createCorporateEvent: {
      __args: {
        data: {
          name: opportunityName?.trim() || 'Evento',
          opportunityId,
          ...data,
        },
      },
      id: true,
    },
  } as never);

  return requireMutationRecord(
    response,
    'createCorporateEvent',
    'Não foi possível criar o evento.',
  ).id;
};

const completeTask = async (client: TaskCompletionClient, taskId: string) => {
  const response = await client.mutation({
    updateTask: {
      __args: { id: taskId, data: { status: 'DONE' } },
      id: true,
    },
  });

  requireMutationRecord(
    response,
    'updateTask',
    'Não foi possível concluir a tarefa.',
  );
};

// Qualification tasks intentionally never update eventProcessStage. Moving
// the Kanban card remains the only action that can advance the funnel.
export const completeQualificationTask = async ({
  client,
  taskId,
  taskTitle,
  opportunityId,
  opportunityName,
  corporateEventId,
  values,
}: {
  client: TaskCompletionClient;
  taskId: string;
  taskTitle: string | null;
  opportunityId: string;
  opportunityName: string | null;
  corporateEventId: string | null;
  values: QualificationValues;
}): Promise<QualificationTaskCompletion> => {
  const title = taskTitle?.trim();

  if (title === GSH_QUALIFICATION_EVENT_TYPE_TASK_TITLE) {
    const eventType = values.eventType?.trim();

    if (!eventType) {
      throw new Error('Selecione o tipo de evento.');
    }

    const eventId = await saveCorporateEvent({
      client,
      corporateEventId,
      opportunityId,
      opportunityName,
      data: { eventType },
    });
    await completeTask(client, taskId);

    return { eventType, corporateEvent: { id: eventId } };
  }

  if (title === GSH_QUALIFICATION_AUDIENCE_TASK_TITLE) {
    const audience = values.audience;

    if (!Number.isInteger(audience) || !audience || audience < 0) {
      throw new Error('Informe um público estimado válido.');
    }

    await updateOpportunity(client, opportunityId, { eventAudience: audience });
    await completeTask(client, taskId);

    return { eventAudience: audience };
  }

  if (title === GSH_QUALIFICATION_LOCATION_CITY_TASK_TITLE) {
    const location = values.location?.trim();
    const city = values.city?.trim();

    if (!location || !city) {
      throw new Error('Informe o local e a cidade do evento.');
    }

    const eventId = await saveCorporateEvent({
      client,
      corporateEventId,
      opportunityId,
      opportunityName,
      data: { city },
    });
    await updateOpportunity(client, opportunityId, { eventLocation: location });
    await completeTask(client, taskId);

    return {
      eventLocation: location,
      corporateEvent: { id: eventId, city },
    };
  }

  if (title === GSH_QUALIFICATION_EVENT_DATE_TASK_TITLE) {
    const eventAt = values.eventAt;
    const date = eventAt ? new Date(eventAt) : null;

    if (!date || Number.isNaN(date.getTime())) {
      throw new Error('Informe uma data válida para o evento.');
    }

    const normalizedEventAt = date.toISOString();
    await updateOpportunity(client, opportunityId, {
      eventAt: normalizedEventAt,
    });
    await completeTask(client, taskId);

    return { eventAt: normalizedEventAt };
  }

  if (title === GSH_QUALIFICATION_ESTIMATED_AMOUNT_TASK_TITLE) {
    const amount = values.amount;

    if (!Number.isFinite(amount) || !amount || amount < 0) {
      throw new Error('Informe um valor estimado válido.');
    }

    const currency = toCurrency(amount);

    if (!currency) {
      throw new Error('Informe um valor estimado válido.');
    }

    await updateOpportunity(client, opportunityId, { amount: currency });
    await completeTask(client, taskId);

    return { amount: currency };
  }

  throw new Error('Esta tarefa não é uma tarefa de qualificação.');
};
