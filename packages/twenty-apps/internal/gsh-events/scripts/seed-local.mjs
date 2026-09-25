import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const apiUrl = process.env.TWENTY_API_URL ?? 'http://localhost:3000';
const remoteName = process.env.TWENTY_REMOTE ?? 'gsh-local';
const configPath = path.join(os.homedir(), '.twenty', 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const apiKey = process.env.TWENTY_API_KEY ?? config.remotes?.[remoteName]?.apiKey;

if (!apiKey) {
  throw new Error(`Remote ${remoteName} does not have an API key.`);
}

const request = async (pathname, options = {}) => {
  const response = await fetch(`${apiUrl}/rest/${pathname}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const body = await response.json();

  if (!response.ok) {
    throw new Error(`${options.method ?? 'GET'} ${pathname} failed (${response.status}): ${JSON.stringify(body)}`);
  }

  return body.data ?? body;
};

const list = async (collection) => {
  const data = await request(`${collection}?limit=60`);

  return data[collection] ?? [];
};

const create = async (collection, payload) => {
  const data = await request(collection, { method: 'POST', body: JSON.stringify(payload) });

  return Object.values(data)[0];
};

const findOrCreate = async (collection, predicate, payload) => {
  const existing = (await list(collection)).find(predicate);

  return existing ?? create(collection, payload);
};

const money = (amountBRL) => ({ amountMicros: amountBRL * 1_000_000, currencyCode: 'BRL' });
const richText = (markdown) => ({ markdown });
const atHour = (hour) => {
  const value = new Date();
  value.setHours(hour, 0, 0, 0);

  return value.toISOString();
};

const cases = [
  {
    key: 'INTERNO',
    opportunityName: '[DEMO GSH] Evento interno — Summit executivo',
    companyName: '[DEMO GSH] Cliente Interno',
    contact: { firstName: 'Marina', lastName: 'Demo Interno' },
    email: 'marina.interno@example.com',
    taxId: '00.000.000/0001-91',
    source: 'EMAIL',
    modality: 'INTERNAL',
    eventType: 'COFFEE_BREAK',
    location: 'Venue GSH',
    city: 'Rio de Janeiro',
    audience: 80,
    amount: 18_000,
    eventAt: atHour(16),
    situation: 'FEEDBACK_PENDING',
    invoiceStatus: 'ISSUED',
    contractStatus: 'SIGNED',
    executionStatus: 'COMPLETED',
    feedbackStatus: 'PENDING',
    serviceOrderStatus: 'DISTRIBUTED',
    distributionStatus: 'YES',
    logistics: { assemblyStatus: 'READY', travelStatus: 'NOT_APPLICABLE', supplyStatus: 'READY', teamStatus: 'READY' },
  },
  {
    key: 'EXTERNO',
    opportunityName: '[DEMO GSH] Evento externo — Convenção comercial',
    companyName: '[DEMO GSH] Cliente Externo',
    contact: { firstName: 'Rafael', lastName: 'Demo Externo' },
    email: 'rafael.externo@example.com',
    taxId: '00.000.000/0002-72',
    source: 'WHATSAPP',
    modality: 'EXTERNAL',
    eventType: 'COCKTAIL',
    location: 'Centro de Convenções',
    city: 'Belo Horizonte',
    audience: 140,
    amount: 32_500,
    eventAt: atHour(19),
    situation: 'FORMALIZATION_IN_PROGRESS',
    invoiceStatus: 'REQUESTED',
    contractStatus: 'SENT',
    executionStatus: 'SCHEDULED',
    feedbackStatus: 'PENDING',
    serviceOrderStatus: 'ISSUED',
    distributionStatus: 'PARTIAL',
    logistics: { assemblyStatus: 'READY', travelStatus: 'READY', supplyStatus: 'PENDING', teamStatus: 'READY' },
  },
];

for (const eventCase of cases) {
  const company = await findOrCreate(
    'companies',
    (record) => record.name === eventCase.companyName,
    { name: eventCase.companyName, legalName: `${eventCase.companyName} Ltda.`, taxId: eventCase.taxId, billingEmail: eventCase.email },
  );
  const person = await findOrCreate(
    'people',
    (record) => record.emails?.primaryEmail === eventCase.email,
    { name: eventCase.contact, emails: { primaryEmail: eventCase.email, additionalEmails: [] }, companyId: company.id, eventContactRole: 'DECISION_MAKER' },
  );
  const opportunity = await findOrCreate(
    'opportunities',
    (record) => record.name === eventCase.opportunityName,
    {
      name: eventCase.opportunityName,
      companyId: company.id,
      pointOfContactId: person.id,
      gshFunnel: 'CORPORATE_EVENT',
      eventProcessStage: 'PRODUCTION_FORMALIZATION_EVENT',
      eventCurrentSituation: eventCase.situation,
      eventCurrentPending: eventCase.key === 'INTERNO' ? 'Coletar feedback' : 'Concluir NF e contrato',
      eventNextAction: eventCase.key === 'INTERNO' ? 'Solicitar retorno do cliente' : 'Acompanhar formalização',
      eventNextActionAt: eventCase.eventAt,
      eventSource: eventCase.source,
      eventModality: eventCase.modality,
      eventAt: eventCase.eventAt,
      eventLocation: eventCase.location,
      eventAudience: eventCase.audience,
      amount: money(eventCase.amount),
      eventClosedAmount: money(eventCase.amount),
      eventPaymentTerms: '50% na contratação e 50% antes do evento',
      eventAcceptanceEvidence: 'Aceite registrado no cenário demonstrativo local.',
      currentProposalVersion: 2,
      purchaseFormStatus: 'COMPLETED',
      invoiceStatus: eventCase.invoiceStatus,
      contractStatus: eventCase.contractStatus,
    },
  );
  const corporateEvent = await findOrCreate(
    'corporateEvents',
    (record) => record.name === `${eventCase.opportunityName} — Evento`,
    {
      name: `${eventCase.opportunityName} — Evento`,
      opportunityId: opportunity.id,
      modality: eventCase.modality,
      eventType: eventCase.eventType,
      startAt: eventCase.eventAt,
      endAt: new Date(new Date(eventCase.eventAt).getTime() + 4 * 60 * 60 * 1000).toISOString(),
      location: eventCase.location,
      city: eventCase.city,
      estimatedAudience: eventCase.audience,
      confirmedAudience: eventCase.audience - 5,
      serviceFormat: eventCase.key === 'INTERNO' ? 'Hospitalidade no venue' : 'Operação off-site',
      rooms: eventCase.key === 'INTERNO' ? 'Salão principal e foyer' : 'Auditório e área externa',
      menuSummary: richText('Cardápio demonstrativo aprovado na proposta v2.'),
      restrictions: richText('Prever opções vegetarianas e sem lactose.'),
      ...eventCase.logistics,
      executionStatus: eventCase.executionStatus,
      executionNotes: richText(eventCase.key === 'INTERNO' ? 'Execução concluída sem ocorrência crítica.' : 'Execução agendada.'),
      feedbackStatus: eventCase.feedbackStatus,
    },
  );

  for (const version of [1, 2]) {
    await findOrCreate(
      'eventProposals',
      (record) => record.name === `${eventCase.opportunityName} — Proposta v${version}`,
      {
        name: `${eventCase.opportunityName} — Proposta v${version}`,
        version,
        status: version === 1 ? 'SUPERSEDED' : 'ACCEPTED',
        total: money(eventCase.amount - (2 - version) * 1_000),
        perPerson: money(Math.round(eventCase.amount / eventCase.audience)),
        paymentTerms: richText('50% na contratação e 50% antes do evento.'),
        validUntil: eventCase.eventAt,
        sentAt: new Date(new Date(eventCase.eventAt).getTime() - (8 - version) * 24 * 60 * 60 * 1000).toISOString(),
        changeSummary: richText(version === 1 ? 'Versão inicial.' : 'Ajustes finais de escopo e valor.'),
        opportunityId: opportunity.id,
        corporateEventId: corporateEvent.id,
      },
    );
  }

  await findOrCreate(
    'eventServiceOrders',
    (record) => record.name === `${eventCase.opportunityName} — OS`,
    {
      name: `${eventCase.opportunityName} — OS`,
      opportunityId: opportunity.id,
      corporateEventId: corporateEvent.id,
      status: eventCase.serviceOrderStatus,
      eventAt: eventCase.eventAt,
      timeline: richText('14:00 montagem · 16:00 início · 20:00 encerramento'),
      finalMenu: richText('Menu final conforme proposta v2.'),
      structureAndEquipment: richText('Mobiliário, utensílios e equipamentos conferidos.'),
      teamGuidance: richText('Briefing operacional concluído com a equipe.'),
      responsible: eventCase.key === 'INTERNO' ? 'Operações Venue' : 'Operações Externas',
      distributionStatus: eventCase.distributionStatus,
      distributedAt: new Date().toISOString(),
    },
  );
}

console.log('Cenários locais GSH disponíveis: evento interno e evento externo.');
