import { defineField, FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';
import { EVENT_MODALITY } from 'src/constants/domain-options';
import { OPPORTUNITY_MODALITY_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: OPPORTUNITY_MODALITY_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: FieldType.SELECT,
  name: 'eventModality',
  label: 'Modalidade do evento',
  icon: 'IconMapPin',
  isNullable: true,
  options: [
    { id: 'c4217a57-544b-4477-a04f-8e9190e6447b', value: EVENT_MODALITY.INTERNAL, label: 'Interno / na casa', position: 0, color: 'blue' },
    { id: '2f9daaca-daeb-4e81-bb24-6915cc902d94', value: EVENT_MODALITY.EXTERNAL, label: 'Externo / fora da casa', position: 1, color: 'orange' },
  ],
});
