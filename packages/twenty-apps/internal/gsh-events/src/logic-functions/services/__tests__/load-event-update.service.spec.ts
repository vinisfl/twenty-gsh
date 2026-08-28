import { describe, expect, it, vi } from 'vitest';
import type { CoreApiClient } from 'twenty-client-sdk/core';
import { loadEventUpdateSnapshot } from 'src/logic-functions/services/load-event-update.service';

describe('loadEventUpdateSnapshot', () => {
  it('maps the opportunity and picks the greatest proposal version', async () => {
    const client = {
      query: vi.fn().mockResolvedValue({
        opportunities: {
          edges: [{ node: {
            id: 'opportunity-id',
            name: 'Conferência',
            amount: { amountMicros: 10_000_000, currencyCode: 'BRL' },
            corporateEvents: { edges: [{ node: { id: 'event-id', confirmedAudience: 90 } }] },
            eventProposals: { edges: [
              { node: { id: 'proposal-1', version: 1, name: 'v1' } },
              { node: { id: 'proposal-2', version: 2, name: 'v2' } },
            ] },
            eventServiceOrders: { edges: [] },
          } }],
        },
      }),
    } as unknown as CoreApiClient;

    const snapshot = await loadEventUpdateSnapshot('opportunity-id', client);

    expect(snapshot?.opportunity.amountBRL).toBe(10);
    expect(snapshot?.event.confirmedAudience).toBe(90);
    expect(snapshot?.latestProposal).toMatchObject({ version: 2, name: 'v2' });
  });

  it.each([
    ['Evento', { corporateEvents: { edges: [{ node: { id: 'event-1' } }, { node: { id: 'event-2' } }] } }],
    ['Ordem de serviço', { eventServiceOrders: { edges: [{ node: { id: 'os-1' } }, { node: { id: 'os-2' } }] } }],
  ])('rejects duplicate related records for %s', async (label, relations) => {
    const client = {
      query: vi.fn().mockResolvedValue({
        opportunities: { edges: [{ node: { id: 'opportunity-id', ...relations } }] },
      }),
    } as unknown as CoreApiClient;

    await expect(loadEventUpdateSnapshot('opportunity-id', client)).rejects.toThrow(
      `mais de um registro de ${label}`,
    );
  });
});
