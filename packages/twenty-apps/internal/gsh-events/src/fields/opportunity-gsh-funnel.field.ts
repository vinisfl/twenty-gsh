import { defineField, FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

import { OPPORTUNITY_GSH_FUNNEL_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: OPPORTUNITY_GSH_FUNNEL_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: FieldType.SELECT,
  name: 'gshFunnel',
  label: 'Funil GSH',
  description: 'Separa o funil de eventos de outras oportunidades do workspace.',
  icon: 'IconFilter',
  isNullable: true,
  options: [
    { id: '1c0c81cd-1652-4216-83f4-cd65a9e97011', value: 'CORPORATE_EVENT', label: 'Evento corporativo', position: 0, color: 'blue' },
  ],
});
