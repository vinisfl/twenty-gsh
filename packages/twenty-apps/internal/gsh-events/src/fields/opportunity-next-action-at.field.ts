import { defineField, FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';
import { OPPORTUNITY_NEXT_ACTION_AT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: OPPORTUNITY_NEXT_ACTION_AT_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: FieldType.DATE_TIME,
  name: 'eventNextActionAt',
  label: 'Data da próxima ação',
  icon: 'IconCalendarDue',
  isNullable: true,
});
