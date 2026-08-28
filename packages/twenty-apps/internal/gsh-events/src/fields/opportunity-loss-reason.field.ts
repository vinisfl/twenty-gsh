import { defineField, FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';
import { OPPORTUNITY_LOSS_REASON_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: OPPORTUNITY_LOSS_REASON_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: FieldType.SELECT,
  name: 'eventLossReason',
  label: 'Motivo da perda',
  icon: 'IconCircleX',
  isNullable: true,
  options: [
    { id: '5b6afbe9-a15b-498c-b970-f71b2e8b8013', value: 'PRICE', label: 'Preço', position: 0, color: 'red' },
    { id: '1a3cbd5e-03a0-4451-b185-921dd3c21b9c', value: 'DATE', label: 'Data ou disponibilidade', position: 1, color: 'orange' },
    { id: 'ca47ae59-feb4-4eaf-84ff-d8d99a92862c', value: 'SCOPE', label: 'Escopo', position: 2, color: 'yellow' },
    { id: 'dedc4c9a-4993-48d3-8653-d09c096db7f9', value: 'COMPETITOR', label: 'Concorrente', position: 3, color: 'purple' },
    { id: 'e1af8c9b-e90a-48c5-b225-1daadb508e9a', value: 'NO_RESPONSE', label: 'Sem retorno', position: 4, color: 'gray' },
    { id: '4d4d82c3-cdc6-4196-9d36-8ae0c21fa698', value: 'OTHER', label: 'Outro', position: 5, color: 'gray' },
  ],
});
