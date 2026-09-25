import { defineField, FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';
import { OPPORTUNITY_CURRENT_PENDING_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: OPPORTUNITY_CURRENT_PENDING_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: FieldType.TEXT,
  name: 'eventCurrentPending',
  label: 'Pendência atual',
  icon: 'IconAlertCircle',
  isNullable: true,
});
