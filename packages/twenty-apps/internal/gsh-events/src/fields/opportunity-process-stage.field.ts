import { defineField, FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

import { EVENT_PROCESS_STAGE } from 'src/constants/domain-options';
import { OPPORTUNITY_PROCESS_STAGE_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export const EVENT_PROCESS_STAGE_OPTIONS = [
  { id: '26f5ddc3-ff3a-4476-b171-0322f6cff80a', value: EVENT_PROCESS_STAGE.ENTRY, label: '1. Entrada', position: 0, color: 'gray' as const },
  { id: '3a006b3c-708e-4562-af52-4e84cd58b1f1', value: EVENT_PROCESS_STAGE.QUALIFICATION, label: '2. Qualificação', position: 1, color: 'blue' as const },
  { id: '158f00eb-156e-46c6-ae73-8f75b8d0cc1f', value: EVENT_PROCESS_STAGE.PROPOSAL_NEGOTIATION, label: '3. Proposta e negociação', position: 2, color: 'yellow' as const },
  { id: '5ddd7989-b540-42f6-80cf-dba2b91d88d2', value: EVENT_PROCESS_STAGE.ACCEPTANCE_REGISTRATION, label: '4. Aceite e cadastro', position: 3, color: 'purple' as const },
  { id: 'a4d9aa3e-ba0f-48bd-b0b8-db2b7d06201e', value: EVENT_PROCESS_STAGE.PRODUCTION_FORMALIZATION_EVENT, label: '5. Produção / formalização / evento', position: 4, color: 'orange' as const },
  { id: '06ba8d97-3350-44b7-bece-ec1643b6067c', value: EVENT_PROCESS_STAGE.CLOSED, label: 'Encerrado', position: 5, color: 'green' as const },
  { id: '4b85a2d6-1df2-4f4f-aa1f-857d9ef14d38', value: EVENT_PROCESS_STAGE.LOST, label: 'Perdido', position: 6, color: 'red' as const },
  { id: '85236e7e-ab44-4a2b-b073-b48c42e1b7fb', value: EVENT_PROCESS_STAGE.CANCELLED, label: 'Cancelado', position: 7, color: 'gray' as const },
];

export default defineField({
  universalIdentifier: OPPORTUNITY_PROCESS_STAGE_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: FieldType.SELECT,
  name: 'eventProcessStage',
  label: 'Etapa do evento',
  icon: 'IconRoute',
  defaultValue: `'${EVENT_PROCESS_STAGE.ENTRY}'`,
  options: EVENT_PROCESS_STAGE_OPTIONS,
});
