import { defineField, FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

import { EVENT_CURRENT_SITUATION } from 'src/constants/domain-options';
import { OPPORTUNITY_CURRENT_SITUATION_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: OPPORTUNITY_CURRENT_SITUATION_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: FieldType.SELECT,
  name: 'eventCurrentSituation',
  label: 'Situação atual',
  description: 'Detalha o trabalho em curso dentro da última macroetapa.',
  icon: 'IconActivity',
  isNullable: true,
  options: [
    { id: '153180d6-cacb-42c0-b0a4-2aac652530e0', value: EVENT_CURRENT_SITUATION.PREPARE_OS, label: 'Preparar OS', position: 0, color: 'purple' },
    { id: 'd40104d9-b516-44b1-ab6a-c11a77f2db11', value: EVENT_CURRENT_SITUATION.FORMALIZATION_IN_PROGRESS, label: 'Formalização em andamento', position: 1, color: 'yellow' },
    { id: '3be09eef-ef93-4fec-bde0-2a794a91e149', value: EVENT_CURRENT_SITUATION.EVENT_SCHEDULED, label: 'Evento agendado', position: 2, color: 'blue' },
    { id: 'e0ba603c-ea23-4387-b9f2-7c0433d4bd2a', value: EVENT_CURRENT_SITUATION.IN_EXECUTION, label: 'Em execução', position: 3, color: 'orange' },
    { id: 'f2cb8c5c-bd5c-4e21-b69d-01a41ef9becf', value: EVENT_CURRENT_SITUATION.FEEDBACK_PENDING, label: 'Feedback pendente', position: 4, color: 'red' },
    { id: '34fdc00e-7047-446b-bb7d-9ed8e6badd68', value: EVENT_CURRENT_SITUATION.READY_TO_CLOSE, label: 'Pronto para encerrar', position: 5, color: 'green' },
  ],
});
