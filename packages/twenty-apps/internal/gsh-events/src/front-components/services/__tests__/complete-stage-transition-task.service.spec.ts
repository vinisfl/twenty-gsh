import { describe, expect, it, vi } from 'vitest';
import type { CoreApiClient } from 'twenty-client-sdk/core';

import {
  completeProposalTask,
  completeRegistrationRequestTask,
} from 'src/front-components/services/complete-stage-transition-task.service';

const getOperationNames = (mutation: ReturnType<typeof vi.fn>) =>
  mutation.mock.calls.map(([operation]) => Object.keys(operation)[0]);

describe('stage-transition task completion', () => {
  it('sends a proposal, completes its task, and creates a 24-hour follow-up without moving the opportunity', async () => {
    const mutation = vi.fn().mockImplementation(async (operation: Record<string, unknown>) => {
      if ('createTask' in operation) {
        return { createTask: { id: 'follow-up-task-id' } };
      }

      if ('createTaskTarget' in operation) {
        return { createTaskTarget: { id: 'follow-up-target-id' } };
      }

      if ('updateEventProposal' in operation) {
        return { updateEventProposal: { id: 'proposal-id' } };
      }

      return { updateTask: { id: 'proposal-task-id' } };
    });
    const client = { mutation } as unknown as CoreApiClient;

    await completeProposalTask({
      client,
      opportunityId: 'opportunity-id',
      proposalId: 'proposal-id',
      taskId: 'proposal-task-id',
      sentAt: '2026-09-16T12:00:00.000Z',
      assigneeId: 'owner-id',
      now: new Date('2026-09-15T12:00:00.000Z'),
    });

    expect(getOperationNames(mutation)).toEqual([
      'updateEventProposal',
      'updateTask',
      'createTask',
      'createTaskTarget',
    ]);
    expect(mutation.mock.calls[0][0].updateEventProposal.__args).toEqual({
      id: 'proposal-id',
      data: { status: 'SENT', sentAt: '2026-09-16T12:00:00.000Z' },
    });
    expect(mutation.mock.calls[2][0].createTask.__args.data).toEqual({
      title: 'Fazer follow-up da proposta',
      dueAt: '2026-09-16T12:00:00.000Z',
      status: 'TODO',
      assigneeId: 'owner-id',
    });
    expect(mutation.mock.calls[3][0].createTaskTarget.__args.data).toEqual({
      taskId: 'follow-up-task-id',
      targetOpportunityId: 'opportunity-id',
    });
    expect(
      mutation.mock.calls.some(([operation]) => 'updateOpportunity' in operation),
    ).toBe(false);
  });

  it('records acceptance-request fields and completes its task without creating a task or moving the opportunity', async () => {
    const mutation = vi.fn().mockImplementation(async (operation: Record<string, unknown>) => {
      if ('updateEventProposal' in operation) {
        return { updateEventProposal: { id: 'proposal-id' } };
      }

      if ('updateOpportunity' in operation) {
        return { updateOpportunity: { id: 'opportunity-id' } };
      }

      return { updateTask: { id: 'registration-task-id' } };
    });
    const client = { mutation } as unknown as CoreApiClient;

    await completeRegistrationRequestTask({
      client,
      opportunityId: 'opportunity-id',
      proposalId: 'proposal-id',
      taskId: 'registration-task-id',
      closedAmountBRL: 12_500.25,
      acceptanceEvidence: 'Aceite confirmado por e-mail',
    });

    expect(getOperationNames(mutation)).toEqual([
      'updateEventProposal',
      'updateOpportunity',
      'updateTask',
    ]);
    expect(mutation.mock.calls[0][0].updateEventProposal.__args.data).toEqual({
      status: 'ACCEPTED',
    });
    expect(mutation.mock.calls[1][0].updateOpportunity.__args.data).toEqual({
      eventClosedAmount: { amountMicros: 12_500_250_000, currencyCode: 'BRL' },
      eventAcceptanceEvidence: 'Aceite confirmado por e-mail',
    });
    expect(
      mutation.mock.calls.some(([operation]) => 'createTask' in operation),
    ).toBe(false);
    expect(mutation.mock.calls[1][0].updateOpportunity.__args.data).not.toHaveProperty(
      'eventProcessStage',
    );
  });
});
