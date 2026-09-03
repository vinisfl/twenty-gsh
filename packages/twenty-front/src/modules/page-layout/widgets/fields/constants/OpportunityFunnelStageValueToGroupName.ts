// GSH-specific: maps the funnel stage field's value ("Etapa do evento" /
// eventProcessStage, see gsh-events' opportunity-process-stage.field.ts) to
// the Opportunity record page's stage-named field group it belongs to
// ("Briefing do evento", "Comercial e proposta", "Formalização", "Produção
// do evento", "Pós-evento"). Several stage values collapse onto the same
// early group, and terminal negative outcomes (Lost/Cancelled) are
// intentionally absent — mirroring the funnel stepper's own convention of
// leaving no step "current" for those.
export const OPPORTUNITY_FUNNEL_STAGE_VALUE_TO_GROUP_NAME: Record<
  string,
  string
> = {
  ENTRY: 'Briefing do evento',
  QUALIFICATION: 'Briefing do evento',
  PROPOSAL_NEGOTIATION: 'Comercial e proposta',
  ACCEPTANCE_REGISTRATION: 'Formalização',
  PRODUCTION_FORMALIZATION_EVENT: 'Produção do evento',
  CLOSED: 'Pós-evento',
};
