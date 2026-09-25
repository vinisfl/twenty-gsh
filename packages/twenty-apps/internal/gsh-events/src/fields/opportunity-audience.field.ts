import { defineField, FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';
import { OPPORTUNITY_AUDIENCE_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: OPPORTUNITY_AUDIENCE_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: FieldType.NUMBER,
  name: 'eventAudience',
  label: 'Público estimado',
  icon: 'IconUsers',
  isNullable: true,
});
