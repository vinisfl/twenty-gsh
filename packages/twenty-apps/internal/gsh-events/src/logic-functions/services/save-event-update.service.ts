import { CoreApiClient } from 'twenty-client-sdk/core';

import { compactUpdateData } from 'src/logic-functions/utils/compact-update-data.util';
import { toCurrency } from 'src/logic-functions/utils/to-currency.util';
import { toRichText } from 'src/logic-functions/utils/to-rich-text.util';
import type { SaveEventUpdateRequest } from 'src/types/save-event-update-request';

export const saveEventUpdate = async (
  request: SaveEventUpdateRequest,
  client = new CoreApiClient(),
): Promise<void> => {
  const { opportunityId, opportunity, event, proposal, serviceOrder, company } = request;

  await client.mutation({
    updateOpportunity: {
      __args: {
        id: opportunityId,
        data: compactUpdateData({
          gshFunnel: 'CORPORATE_EVENT',
          eventProcessStage: opportunity.stage,
          eventCurrentSituation: opportunity.currentSituation,
          eventCurrentPending: opportunity.currentPending,
          eventNextAction: opportunity.nextAction,
          eventNextActionAt: opportunity.nextActionAt,
          eventSource: opportunity.source,
          eventModality: opportunity.modality,
          eventAt: opportunity.eventAt,
          eventLocation: opportunity.location,
          eventAudience: opportunity.audience,
          amount: toCurrency(opportunity.amountBRL),
          eventClosedAmount: toCurrency(opportunity.closedAmountBRL),
          eventPaymentTerms: opportunity.paymentTerms,
          eventAcceptanceEvidence: opportunity.acceptanceEvidence,
          purchaseFormStatus: opportunity.purchaseFormStatus,
          invoiceStatus: opportunity.invoiceStatus,
          contractStatus: opportunity.contractStatus,
          eventLossReason: opportunity.lossReason,
          currentProposalVersion: proposal.createNewVersion ? proposal.version : undefined,
        }),
      },
      id: true,
    },
  } as never);

  const eventData = compactUpdateData({
    name: event.name,
    eventType: event.eventType,
    modality: opportunity.modality,
    startAt: event.startAt ?? opportunity.eventAt,
    endAt: event.endAt,
    location: opportunity.location,
    city: event.city,
    estimatedAudience: opportunity.audience,
    serviceFormat: event.serviceFormat,
    rooms: event.rooms,
    menuSummary: toRichText(event.menuSummary),
    restrictions: toRichText(event.restrictions),
    confirmedAudience: event.confirmedAudience,
    assemblyStatus: event.assemblyStatus,
    travelStatus: event.travelStatus,
    supplyStatus: event.supplyStatus,
    teamStatus: event.teamStatus,
    executionStatus: event.executionStatus,
    executionNotes: toRichText(event.executionNotes),
    feedbackStatus: event.feedbackStatus,
    feedback: toRichText(event.feedback),
  });

  let eventId = event.id;

  if (eventId) {
    await client.mutation({ updateCorporateEvent: { __args: { id: eventId, data: eventData }, id: true } } as never);
  } else {
    const response = (await client.mutation({
      createCorporateEvent: {
        __args: { data: { ...eventData, name: event.name || 'Evento', opportunityId } },
        id: true,
      },
    } as never)) as unknown as { createCorporateEvent?: { id?: string } };
    eventId = response.createCorporateEvent?.id;
  }

  if (company.id) {
    await client.mutation({
      updateCompany: {
        __args: { id: company.id, data: compactUpdateData({ legalName: company.legalName, taxId: company.taxId, billingEmail: company.billingEmail }) },
        id: true,
      },
    } as never);
  }

  if (proposal.createNewVersion) {
    await client.mutation({
      createEventProposal: {
        __args: {
          data: compactUpdateData({
            name: proposal.name || `Proposta v${proposal.version ?? 1}`,
            version: proposal.version,
            status: proposal.status,
            total: toCurrency(proposal.totalBRL),
            perPerson: toCurrency(proposal.perPersonBRL),
            validUntil: proposal.validUntil,
            paymentTerms: toRichText(proposal.paymentTerms),
            documentUrl: proposal.documentUrl,
            sentAt: proposal.sentAt,
            changeSummary: toRichText(proposal.changeSummary),
            opportunityId,
            corporateEventId: eventId,
          }),
        },
        id: true,
      },
    } as never);
  }

  if (serviceOrder.enabled || serviceOrder.id) {
    const data = compactUpdateData({
      name: serviceOrder.name || 'Ordem de serviço',
      status: serviceOrder.status,
      timeline: toRichText(serviceOrder.timeline),
      finalMenu: toRichText(serviceOrder.finalMenu),
      structureAndEquipment: toRichText(serviceOrder.structureAndEquipment),
      teamGuidance: toRichText(serviceOrder.teamGuidance),
      responsible: serviceOrder.responsible,
      eventAt: event.startAt ?? opportunity.eventAt,
      distributionStatus: serviceOrder.distributionStatus,
      distributedAt: serviceOrder.distributedAt,
      documentUrl: serviceOrder.documentUrl,
    });

    if (serviceOrder.id) {
      await client.mutation({ updateEventServiceOrder: { __args: { id: serviceOrder.id, data }, id: true } } as never);
    } else {
      await client.mutation({
        createEventServiceOrder: {
          __args: { data: { ...data, opportunityId, corporateEventId: eventId } },
          id: true,
        },
      } as never);
    }
  }
};
