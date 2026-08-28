import { defineField, FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';
import { OPPORTUNITY_SOURCE_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: OPPORTUNITY_SOURCE_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: FieldType.SELECT,
  name: 'eventSource',
  label: 'Origem',
  icon: 'IconAffiliate',
  isNullable: true,
  options: [
    { id: '8836943a-a3b2-4daa-aa2b-541bbd91715c', value: 'EMAIL', label: 'E-mail', position: 0, color: 'blue' },
    { id: 'e4e49a0b-4dc6-468e-8dba-238e0cc51538', value: 'WHATSAPP', label: 'WhatsApp', position: 1, color: 'green' },
    { id: 'f5f3692e-8187-4ba9-b513-40a2151f999b', value: 'REFERRAL', label: 'Indicação', position: 2, color: 'purple' },
    { id: '09ebdd46-77fa-41ff-9030-5cea3ae13a5e', value: 'BH', label: 'BH', position: 3, color: 'yellow' },
    { id: '98583d1d-cec1-4e66-9956-d67633b228ff', value: 'RIO', label: 'Rio', position: 4, color: 'orange' },
    { id: '0c905258-7d1c-4f72-8190-19995b3fff66', value: 'OTHER', label: 'Outro', position: 5, color: 'gray' },
  ],
});
