import { CoreApiClient } from 'twenty-client-sdk/core';

import { RelatedRecordCardinalityError } from 'src/errors/related-record-cardinality.error';
import type { EventUpdateSnapshot } from 'src/types/event-update-snapshot';

type RichTextValue = { markdown?: string | null } | null | undefined;
type MoneyValue = { amountMicros?: number | null } | null | undefined;

type EventNode = {
  id: string;
  name?: string | null;
  eventType?: string | null;
  startAt?: string | null;
  endAt?: string | null;
  city?: string | null;
  serviceFormat?: string | null;
  rooms?: string | null;
  menuSummary?: RichTextValue;
  restrictions?: RichTextValue;
  confirmedAudience?: number | null;
  assemblyStatus?: string | null;
  travelStatus?: string | null;
  supplyStatus?: string | null;
  teamStatus?: string | null;
  executionStatus?: string | null;
  executionNotes?: RichTextValue;
  feedbackStatus?: string | null;
  feedback?: RichTextValue;
};

type ProposalNode = {
  id: string;
  name?: string | null;
  version?: number | null;
  status?: string | null;
  total?: MoneyValue;
  perPerson?: MoneyValue;
  validUntil?: string | null;
  paymentTerms?: RichTextValue;
  documentUrl?: string | null;
  sentAt?: string | null;
  changeSummary?: RichTextValue;
};

type ServiceOrderNode = {
  id: string;
  name?: string | null;
  status?: string | null;
  timeline?: RichTextValue;
  finalMenu?: RichTextValue;
  structureAndEquipment?: RichTextValue;
  teamGuidance?: RichTextValue;
  responsible?: string | null;
  distributionStatus?: string | null;
  distributedAt?: string | null;
  documentUrl?: string | null;
};

type OpportunityNode = {
  id: string;
  name?: string | null;
  amount?: MoneyValue;
  eventProcessStage?: string | null;
  eventCurrentSituation?: string | null;
  eventCurrentPending?: string | null;
  eventNextAction?: string | null;
  eventNextActionAt?: string | null;
  eventSource?: string | null;
  eventModality?: string | null;
  eventAt?: string | null;
  eventLocation?: string | null;
  eventAudience?: number | null;
  eventPaymentTerms?: string | null;
  eventClosedAmount?: MoneyValue;
  eventAcceptanceEvidence?: string | null;
  purchaseFormStatus?: string | null;
  invoiceStatus?: string | null;
  contractStatus?: string | null;
  eventLossReason?: string | null;
  company?: {
    id: string;
    name?: string | null;
    legalName?: string | null;
    taxId?: string | null;
    billingEmail?: string | null;
  } | null;
  corporateEvents?: { edges?: Array<{ node: EventNode }> } | null;
  eventProposals?: { edges?: Array<{ node: ProposalNode }> } | null;
  eventServiceOrders?: { edges?: Array<{ node: ServiceOrderNode }> } | null;
};

type OpportunityQueryResult = {
  opportunities?: { edges?: Array<{ node: OpportunityNode }> };
};

const markdown = (value: RichTextValue): string | undefined =>
  value?.markdown ?? undefined;

const reais = (value: MoneyValue): number | undefined =>
  typeof value?.amountMicros === 'number'
    ? value.amountMicros / 1_000_000
    : undefined;

export const loadEventUpdateSnapshot = async (
  opportunityId: string,
  client = new CoreApiClient(),
): Promise<EventUpdateSnapshot | null> => {
  // These app fields become part of the generated client only after the first
  // sync; the cast keeps the source buildable before that bootstrap step.
  const result = (await client.query({
    opportunities: {
      __args: { filter: { id: { eq: opportunityId } }, first: 1 },
      edges: {
        node: {
          id: true,
          name: true,
          amount: { amountMicros: true, currencyCode: true },
          eventProcessStage: true,
          eventCurrentSituation: true,
          eventCurrentPending: true,
          eventNextAction: true,
          eventNextActionAt: true,
          eventSource: true,
          eventModality: true,
          eventAt: true,
          eventLocation: true,
          eventAudience: true,
          eventPaymentTerms: true,
          eventClosedAmount: { amountMicros: true, currencyCode: true },
          eventAcceptanceEvidence: true,
          purchaseFormStatus: true,
          invoiceStatus: true,
          contractStatus: true,
          eventLossReason: true,
          company: { id: true, name: true, legalName: true, taxId: true, billingEmail: true },
          corporateEvents: { edges: { node: { id: true, name: true, eventType: true, startAt: true, endAt: true, city: true, confirmedAudience: true, serviceFormat: true, rooms: true, menuSummary: { markdown: true }, restrictions: { markdown: true }, assemblyStatus: true, travelStatus: true, supplyStatus: true, teamStatus: true, executionStatus: true, executionNotes: { markdown: true }, feedbackStatus: true, feedback: { markdown: true } } } },
          eventProposals: { edges: { node: { id: true, name: true, version: true, status: true, total: { amountMicros: true, currencyCode: true }, perPerson: { amountMicros: true, currencyCode: true }, validUntil: true, paymentTerms: { markdown: true }, documentUrl: true, sentAt: true, changeSummary: { markdown: true } } } },
          eventServiceOrders: { edges: { node: { id: true, name: true, status: true, timeline: { markdown: true }, finalMenu: { markdown: true }, structureAndEquipment: { markdown: true }, teamGuidance: { markdown: true }, responsible: true, distributionStatus: true, distributedAt: true, documentUrl: true } } },
        },
      },
    },
  } as never)) as unknown as OpportunityQueryResult;

  const opportunity = result.opportunities?.edges?.[0]?.node;

  if (!opportunity) {
    return null;
  }

  const eventEdges = opportunity.corporateEvents?.edges ?? [];
  const serviceOrderEdges = opportunity.eventServiceOrders?.edges ?? [];

  if (eventEdges.length > 1) {
    throw new RelatedRecordCardinalityError('Evento');
  }

  if (serviceOrderEdges.length > 1) {
    throw new RelatedRecordCardinalityError('Ordem de serviço');
  }

  const event = eventEdges[0]?.node;
  const proposal = [...(opportunity.eventProposals?.edges ?? [])]
    .map(({ node }) => node)
    .sort((left, right) => (right.version ?? 0) - (left.version ?? 0))[0];
  const serviceOrder = serviceOrderEdges[0]?.node;

  return {
    opportunityId: opportunity.id,
    opportunityName: opportunity.name ?? 'Evento sem nome',
    companyName: opportunity.company?.name ?? undefined,
    opportunity: {
      stage: opportunity.eventProcessStage ?? undefined,
      currentSituation: opportunity.eventCurrentSituation ?? undefined,
      currentPending: opportunity.eventCurrentPending ?? undefined,
      nextAction: opportunity.eventNextAction ?? undefined,
      nextActionAt: opportunity.eventNextActionAt ?? undefined,
      source: opportunity.eventSource ?? undefined,
      modality: opportunity.eventModality ?? undefined,
      eventAt: opportunity.eventAt ?? undefined,
      location: opportunity.eventLocation ?? undefined,
      audience: opportunity.eventAudience ?? undefined,
      amountBRL: reais(opportunity.amount),
      closedAmountBRL: reais(opportunity.eventClosedAmount),
      paymentTerms: opportunity.eventPaymentTerms ?? undefined,
      acceptanceEvidence: opportunity.eventAcceptanceEvidence ?? undefined,
      purchaseFormStatus: opportunity.purchaseFormStatus ?? undefined,
      invoiceStatus: opportunity.invoiceStatus ?? undefined,
      contractStatus: opportunity.contractStatus ?? undefined,
      lossReason: opportunity.eventLossReason ?? undefined,
    },
    event: {
      id: event?.id,
      name: event?.name ?? opportunity.name ?? undefined,
      eventType: event?.eventType ?? undefined,
      startAt: event?.startAt ?? opportunity.eventAt ?? undefined,
      endAt: event?.endAt ?? undefined,
      city: event?.city ?? undefined,
      serviceFormat: event?.serviceFormat ?? undefined,
      rooms: event?.rooms ?? undefined,
      menuSummary: markdown(event?.menuSummary),
      restrictions: markdown(event?.restrictions),
      confirmedAudience: event?.confirmedAudience ?? undefined,
      assemblyStatus: event?.assemblyStatus ?? undefined,
      travelStatus: event?.travelStatus ?? undefined,
      supplyStatus: event?.supplyStatus ?? undefined,
      teamStatus: event?.teamStatus ?? undefined,
      executionStatus: event?.executionStatus ?? undefined,
      executionNotes: markdown(event?.executionNotes),
      feedbackStatus: event?.feedbackStatus ?? undefined,
      feedback: markdown(event?.feedback),
    },
    latestProposal: {
      name: proposal?.name ?? undefined,
      version: proposal?.version ?? undefined,
      status: proposal?.status ?? undefined,
      totalBRL: reais(proposal?.total),
      perPersonBRL: reais(proposal?.perPerson),
      validUntil: proposal?.validUntil ?? undefined,
      paymentTerms: markdown(proposal?.paymentTerms),
      documentUrl: proposal?.documentUrl ?? undefined,
      sentAt: proposal?.sentAt ?? undefined,
      changeSummary: markdown(proposal?.changeSummary),
    },
    serviceOrder: {
      id: serviceOrder?.id,
      name: serviceOrder?.name ?? undefined,
      status: serviceOrder?.status ?? undefined,
      timeline: markdown(serviceOrder?.timeline),
      finalMenu: markdown(serviceOrder?.finalMenu),
      structureAndEquipment: markdown(serviceOrder?.structureAndEquipment),
      teamGuidance: markdown(serviceOrder?.teamGuidance),
      responsible: serviceOrder?.responsible ?? undefined,
      distributionStatus: serviceOrder?.distributionStatus ?? undefined,
      distributedAt: serviceOrder?.distributedAt ?? undefined,
      documentUrl: serviceOrder?.documentUrl ?? undefined,
    },
    company: {
      id: opportunity.company?.id,
      legalName: opportunity.company?.legalName ?? undefined,
      taxId: opportunity.company?.taxId ?? undefined,
      billingEmail: opportunity.company?.billingEmail ?? undefined,
    },
  };
};
