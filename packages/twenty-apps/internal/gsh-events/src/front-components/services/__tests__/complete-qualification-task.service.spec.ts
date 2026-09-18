import { describe, expect, it, vi } from 'vitest';
import type { CoreApiClient } from 'twenty-client-sdk/core';

import { completeQualificationTask } from 'src/front-components/services/complete-qualification-task.service';

const getOperationNames = (mutation: ReturnType<typeof vi.fn>) =>
  mutation.mock.calls.map(([operation]) => Object.keys(operation)[0]);

describe('qualification task completion', () => {
  it('stores local and city, then completes only that task without moving the opportunity', async () => {
    const mutation = vi
      .fn()
      .mockImplementation(async (operation: Record<string, unknown>) => {
        if ('createCorporateEvent' in operation) {
          return { createCorporateEvent: { id: 'event-id' } };
        }

        if ('updateOpportunity' in operation) {
          return { updateOpportunity: { id: 'opportunity-id' } };
        }

        return { updateTask: { id: 'qualification-task-id' } };
      });
    const client = { mutation } as unknown as CoreApiClient;

    const completion = await completeQualificationTask({
      client,
      taskId: 'qualification-task-id',
      taskTitle: 'Coletar local/cidade',
      opportunityId: 'opportunity-id',
      opportunityName: 'Evento corporativo',
      corporateEventId: null,
      values: { location: 'Espaço GSH', city: 'São Paulo' },
    });

    expect(getOperationNames(mutation)).toEqual([
      'createCorporateEvent',
      'updateOpportunity',
      'updateTask',
    ]);
    expect(mutation.mock.calls[0][0].createCorporateEvent.__args.data).toEqual({
      name: 'Evento corporativo',
      opportunityId: 'opportunity-id',
      city: 'São Paulo',
    });
    expect(mutation.mock.calls[1][0].updateOpportunity.__args.data).toEqual({
      eventLocation: 'Espaço GSH',
    });
    expect(
      mutation.mock.calls[1][0].updateOpportunity.__args.data,
    ).not.toHaveProperty('eventProcessStage');
    expect(completion).toEqual({
      eventLocation: 'Espaço GSH',
      corporateEvent: { id: 'event-id', city: 'São Paulo' },
    });
  });

  it('rejects incomplete qualification values before any record is persisted', async () => {
    const mutation = vi.fn();
    const client = { mutation } as unknown as CoreApiClient;

    await expect(
      completeQualificationTask({
        client,
        taskId: 'qualification-task-id',
        taskTitle: 'Coletar público estimado',
        opportunityId: 'opportunity-id',
        opportunityName: 'Evento corporativo',
        corporateEventId: null,
        values: { audience: 0 },
      }),
    ).rejects.toThrow('Informe um público estimado válido.');

    expect(mutation).not.toHaveBeenCalled();
  });

  it.each([
    {
      taskTitle: 'Coletar tipo de evento',
      corporateEventId: 'event-id',
      values: { eventType: 'COFFEE_BREAK' },
      mutationName: 'updateCorporateEvent',
      data: { eventType: 'COFFEE_BREAK' },
    },
    {
      taskTitle: 'Coletar público estimado',
      corporateEventId: null,
      values: { audience: 80 },
      mutationName: 'updateOpportunity',
      data: { eventAudience: 80 },
    },
    {
      taskTitle: 'Coletar data do evento',
      corporateEventId: null,
      values: { eventAt: '2026-10-01T10:00:00.000Z' },
      mutationName: 'updateOpportunity',
      data: { eventAt: '2026-10-01T10:00:00.000Z' },
    },
    {
      taskTitle: 'Coletar valor estimado',
      corporateEventId: null,
      values: { amount: 12_500.25 },
      mutationName: 'updateOpportunity',
      data: {
        amount: { amountMicros: 12_500_250_000, currencyCode: 'BRL' },
      },
    },
  ])(
    'stores the required field for $taskTitle and completes that task',
    async ({ taskTitle, corporateEventId, values, mutationName, data }) => {
      const mutation = vi
        .fn()
        .mockImplementation(async (operation: Record<string, unknown>) => {
          if ('updateCorporateEvent' in operation) {
            return { updateCorporateEvent: { id: 'event-id' } };
          }

          if ('updateOpportunity' in operation) {
            return { updateOpportunity: { id: 'opportunity-id' } };
          }

          return { updateTask: { id: 'qualification-task-id' } };
        });
      const client = { mutation } as unknown as CoreApiClient;

      await completeQualificationTask({
        client,
        taskId: 'qualification-task-id',
        taskTitle,
        opportunityId: 'opportunity-id',
        opportunityName: 'Evento corporativo',
        corporateEventId,
        values,
      });

      expect(getOperationNames(mutation)).toEqual([mutationName, 'updateTask']);
      expect(mutation.mock.calls[0][0][mutationName].__args.data).toEqual(data);
      expect(
        mutation.mock.calls[0][0][mutationName].__args.data,
      ).not.toHaveProperty('eventProcessStage');
    },
  );
});
