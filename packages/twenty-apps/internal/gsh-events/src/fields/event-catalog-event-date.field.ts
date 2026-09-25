import { defineField, FieldType } from 'twenty-sdk/define';

import { EVENT_CATALOG_EVENT_DATE_FIELD_UNIVERSAL_IDENTIFIER, EVENT_CATALOG_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: EVENT_CATALOG_EVENT_DATE_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: EVENT_CATALOG_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.DATE,
  name: 'eventDate',
  label: 'Data do evento',
  icon: 'IconCalendar',
  isNullable: true,
});
