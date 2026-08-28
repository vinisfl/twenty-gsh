import { describe, expect, it, vi } from 'vitest';
import type { CoreApiClient } from 'twenty-client-sdk/core';
import { saveEventUpdate } from 'src/logic-functions/services/save-event-update.service';
import type { SaveEventUpdateRequest } from 'src/types/save-event-update-request';

describe('saveEventUpdate', () => {
  it('updates the opportunity and creates one related event', async () => {
    const mutation = vi.fn().mockResolvedValue({ createCorporateEvent: { id: 'event-id' } });
    const client = { mutation } as unknown as CoreApiClient;
    const request: SaveEventUpdateRequest = {
      action: 'SAVE',
      opportunityId: 'opportunity-id',
      opportunity: { stage: 'QUALIFICATION', amountBRL: 12.5 },
      event: { name: 'Evento teste', confirmedAudience: 80 },
      proposal: { createNewVersion: false },
      serviceOrder: { enabled: false },
      company: {},
    };

    await saveEventUpdate(request, client);

    expect(mutation).toHaveBeenCalledTimes(2);
    expect(mutation.mock.calls[0][0].updateOpportunity.__args.data.amount).toEqual({ amountMicros: 12_500_000, currencyCode: 'BRL' });
    expect(mutation.mock.calls[1][0].createCorporateEvent.__args.data).toMatchObject({ name: 'Evento teste', opportunityId: 'opportunity-id' });
  });

  it.each([
    {
      modality: 'INTERNAL',
      logistics: { assemblyStatus: 'READY', travelStatus: 'NOT_APPLICABLE', supplyStatus: 'READY', teamStatus: 'READY' },
    },
    {
      modality: 'EXTERNAL',
      logistics: { assemblyStatus: 'READY', travelStatus: 'READY', supplyStatus: 'READY', teamStatus: 'READY' },
    },
  ])('keeps the same pipeline and varies only logistics for $modality', async ({ modality, logistics }) => {
    const mutation = vi.fn().mockResolvedValue({ createCorporateEvent: { id: 'event-id' } });
    const client = { mutation } as unknown as CoreApiClient;
    const request: SaveEventUpdateRequest = {
      action: 'SAVE',
      opportunityId: `${modality}-opportunity`,
      opportunity: { stage: 'PRODUCTION_FORMALIZATION_EVENT', modality },
      event: { name: `${modality} event`, ...logistics },
      proposal: { createNewVersion: false },
      serviceOrder: { enabled: false },
      company: {},
    };

    await saveEventUpdate(request, client);

    expect(mutation.mock.calls[0][0].updateOpportunity.__args.data.eventProcessStage).toBe('PRODUCTION_FORMALIZATION_EVENT');
    expect(mutation.mock.calls[1][0].createCorporateEvent.__args.data).toMatchObject({ modality, ...logistics });
  });

  it.each([
    {
      modality: 'INTERNAL',
      logistics: { assemblyStatus: 'READY', travelStatus: 'NOT_APPLICABLE', supplyStatus: 'READY', teamStatus: 'READY' },
    },
    {
      modality: 'EXTERNAL',
      logistics: { assemblyStatus: 'READY', travelStatus: 'READY', supplyStatus: 'READY', teamStatus: 'READY' },
    },
  ])('covers the complete $modality event lifecycle', async ({ modality, logistics }) => {
    const mutation = vi.fn().mockImplementation(async (operation: Record<string, unknown>) =>
      'createCorporateEvent' in operation
        ? { createCorporateEvent: { id: `${modality}-event-id` } }
        : {},
    );
    const client = { mutation } as unknown as CoreApiClient;
    const opportunityId = `${modality}-opportunity-id`;
    const eventId = `${modality}-event-id`;
    const eventAt = '2026-09-10T18:00:00.000Z';
    const base: SaveEventUpdateRequest = {
      action: 'SAVE',
      opportunityId,
      opportunity: { modality, eventAt },
      event: { id: eventId, name: `${modality} event`, startAt: eventAt, ...logistics },
      proposal: { createNewVersion: false },
      serviceOrder: { enabled: false },
      company: { id: `${modality}-company-id`, legalName: 'Cliente GSH', taxId: '00.000.000/0001-00', billingEmail: 'financeiro@example.com' },
    };

    await saveEventUpdate({ ...base, opportunity: { ...base.opportunity, stage: 'ENTRY', source: 'EMAIL' }, event: { ...base.event, id: undefined } }, client);
    await saveEventUpdate({ ...base, opportunity: { ...base.opportunity, stage: 'QUALIFICATION', audience: 80, amountBRL: 12_500 }, event: { ...base.event, eventType: 'COFFEE_BREAK', confirmedAudience: 75 } }, client);
    await saveEventUpdate({ ...base, opportunity: { ...base.opportunity, stage: 'PROPOSAL_NEGOTIATION' }, proposal: { createNewVersion: true, name: 'Proposta v1', version: 1, status: 'SENT', totalBRL: 12_500 } }, client);
    await saveEventUpdate({ ...base, opportunity: { ...base.opportunity, stage: 'PROPOSAL_NEGOTIATION' }, proposal: { createNewVersion: true, name: 'Proposta v2', version: 2, status: 'ACCEPTED', totalBRL: 12_000, changeSummary: 'Valor negociado' } }, client);
    await saveEventUpdate({ ...base, opportunity: { ...base.opportunity, stage: 'ACCEPTANCE_REGISTRATION', acceptanceEvidence: 'Aceite por e-mail', closedAmountBRL: 12_000 } }, client);
    await saveEventUpdate({
      ...base,
      opportunity: { ...base.opportunity, stage: 'PRODUCTION_FORMALIZATION_EVENT', currentSituation: 'EVENT_SCHEDULED', purchaseFormStatus: 'COMPLETED', invoiceStatus: 'ISSUED', contractStatus: 'SIGNED' },
      serviceOrder: { enabled: true, name: 'OS do evento', status: 'DISTRIBUTED', distributionStatus: 'YES', distributedAt: '2026-09-08T12:00:00.000Z' },
    }, client);
    await saveEventUpdate({
      ...base,
      opportunity: { ...base.opportunity, stage: 'CLOSED', currentSituation: 'READY_TO_CLOSE', closedAmountBRL: 12_000 },
      event: { ...base.event, executionStatus: 'COMPLETED', executionNotes: 'Evento realizado', feedbackStatus: 'RECEIVED', feedback: 'Cliente satisfeito' },
      serviceOrder: { enabled: true, id: `${modality}-os-id`, status: 'COMPLETED', distributionStatus: 'YES' },
    }, client);

    const calls = mutation.mock.calls.map(([operation]) => operation);
    const stages = calls
      .filter((operation) => 'updateOpportunity' in operation)
      .map((operation) => operation.updateOpportunity.__args.data.eventProcessStage);
    const proposalVersions = calls
      .filter((operation) => 'createEventProposal' in operation)
      .map((operation) => operation.createEventProposal.__args.data.version);
    const createdEvent = calls.find((operation) => 'createCorporateEvent' in operation)?.createCorporateEvent.__args.data;
    const companyUpdate = calls.find((operation) => 'updateCompany' in operation)?.updateCompany.__args.data;
    const acceptanceUpdate = calls
      .filter((operation) => 'updateOpportunity' in operation)
      .find((operation) => operation.updateOpportunity.__args.data.eventProcessStage === 'ACCEPTANCE_REGISTRATION')
      ?.updateOpportunity.__args.data;
    const formalizationUpdate = calls
      .filter((operation) => 'updateOpportunity' in operation)
      .find((operation) => operation.updateOpportunity.__args.data.eventProcessStage === 'PRODUCTION_FORMALIZATION_EVENT')
      ?.updateOpportunity.__args.data;
    const createdServiceOrder = calls.find((operation) => 'createEventServiceOrder' in operation)?.createEventServiceOrder.__args.data;
    const finalEvent = [...calls].reverse().find((operation) => 'updateCorporateEvent' in operation)?.updateCorporateEvent.__args.data;

    expect(stages).toEqual(['ENTRY', 'QUALIFICATION', 'PROPOSAL_NEGOTIATION', 'PROPOSAL_NEGOTIATION', 'ACCEPTANCE_REGISTRATION', 'PRODUCTION_FORMALIZATION_EVENT', 'CLOSED']);
    expect(proposalVersions).toEqual([1, 2]);
    expect(createdEvent).toMatchObject({ opportunityId, name: `${modality} event`, modality, ...logistics });
    expect(companyUpdate).toEqual({ legalName: 'Cliente GSH', taxId: '00.000.000/0001-00', billingEmail: 'financeiro@example.com' });
    expect(acceptanceUpdate).toMatchObject({ eventAcceptanceEvidence: 'Aceite por e-mail', eventClosedAmount: { amountMicros: 12_000_000_000, currencyCode: 'BRL' } });
    expect(formalizationUpdate).toMatchObject({ purchaseFormStatus: 'COMPLETED', invoiceStatus: 'ISSUED', contractStatus: 'SIGNED' });
    expect(createdServiceOrder).toMatchObject({ opportunityId, corporateEventId: eventId, eventAt, status: 'DISTRIBUTED' });
    expect(finalEvent).toMatchObject({ modality, ...logistics, executionStatus: 'COMPLETED', feedbackStatus: 'RECEIVED' });
  });
});
