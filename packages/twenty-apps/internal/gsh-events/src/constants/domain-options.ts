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
