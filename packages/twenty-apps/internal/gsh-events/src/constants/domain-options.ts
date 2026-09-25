export const EVENT_PROCESS_STAGE = {
  ENTRY: 'ENTRY',
  QUALIFICATION: 'QUALIFICATION',
  PROPOSAL_NEGOTIATION: 'PROPOSAL_NEGOTIATION',
  ACCEPTANCE_REGISTRATION: 'ACCEPTANCE_REGISTRATION',
  PRODUCTION_FORMALIZATION_EVENT: 'PRODUCTION_FORMALIZATION_EVENT',
  CLOSED: 'CLOSED',
  LOST: 'LOST',
  CANCELLED: 'CANCELLED',
} as const;

export const EVENT_CURRENT_SITUATION = {
  PREPARE_OS: 'PREPARE_OS',
  FORMALIZATION_IN_PROGRESS: 'FORMALIZATION_IN_PROGRESS',
  EVENT_SCHEDULED: 'EVENT_SCHEDULED',
  IN_EXECUTION: 'IN_EXECUTION',
  FEEDBACK_PENDING: 'FEEDBACK_PENDING',
  READY_TO_CLOSE: 'READY_TO_CLOSE',
} as const;

export const PURCHASE_FORM_STATUS = {
  NOT_STARTED: 'NOT_STARTED',
  SENT: 'SENT',
  COMPLETED: 'COMPLETED',
} as const;

export const INVOICE_STATUS = {
  NOT_REQUESTED: 'NOT_REQUESTED',
  REQUESTED: 'REQUESTED',
  ISSUED: 'ISSUED',
} as const;

export const CONTRACT_STATUS = {
  NOT_STARTED: 'NOT_STARTED',
  SENT: 'SENT',
  SIGNED: 'SIGNED',
} as const;

export const EVENT_MODALITY = {
  INTERNAL: 'INTERNAL',
  EXTERNAL: 'EXTERNAL',
} as const;

export const EVENT_PROPERTY_TYPE = {
  CORPORATE: 'CORPORATE',
  GAME: 'GAME',
  SHOW: 'SHOW',
  OTHER: 'OTHER',
} as const;

// Distinguishes eventCatalog records imported in bulk from the Databricks
// gold layer (bilheteria própria da GSH) from ones created ad hoc by the
// commercial flow — independent from Opportunity.eventModality, which is
// about venue location (na casa / fora da casa), not record origin.
export const EVENT_CATALOG_ORIGIN = {
  INTERNAL: 'INTERNAL',
  EXTERNAL: 'EXTERNAL',
} as const;

// Closed list of GSH venue groups, sourced from gld_dim_evento.venue_grupo
// (Databricks gold layer) — a sponsorship/campaign-level grouping, not the
// physical venue. New venues require adding an option here before the next
// sync/import can classify them.
export const EVENT_CATALOG_VENUE_GROUP = {
  ARENA_MRV: 'ARENA_MRV',
  CASA_COR_SP_2026: 'CASA_COR_SP_2026',
  ESPLANADA: 'ESPLANADA',
  GSH_QUALISTAGE_RJ: 'GSH_QUALISTAGE_RJ',
  MORUMBIS_ANUAL_2026: 'MORUMBIS_ANUAL_2026',
  NUBANK_ANUAL_26: 'NUBANK_ANUAL_26',
  NUBANK_TOUR: 'NUBANK_TOUR',
  PARQUE_AGUA_BRANCA: 'PARQUE_AGUA_BRANCA',
  PARQUE_VILLA_LOBOS: 'PARQUE_VILLA_LOBOS',
  PRO_MAGNO: 'PRO_MAGNO',
  SUHAI_MUSIC_HALL: 'SUHAI_MUSIC_HALL',
} as const;

export const PROPOSAL_STATUS = {
  DRAFT: 'DRAFT',
  SENT: 'SENT',
  SUPERSEDED: 'SUPERSEDED',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
} as const;

export const SERVICE_ORDER_STATUS = {
  PREPARING: 'PREPARING',
  ISSUED: 'ISSUED',
  DISTRIBUTED: 'DISTRIBUTED',
  COMPLETED: 'COMPLETED',
} as const;
