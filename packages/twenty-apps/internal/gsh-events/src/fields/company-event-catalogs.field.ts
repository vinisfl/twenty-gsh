import { defineField, FieldType, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';
import { COMPANY_EVENT_CATALOGS_FIELD_UNIVERSAL_IDENTIFIER, EVENT_CATALOG_COMPANY_FIELD_UNIVERSAL_IDENTIFIER, EVENT_CATALOG_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: COMPANY_EVENT_CATALOGS_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  type: FieldType.RELATION,
  name: 'eventCatalogs',
  label: 'Catálogo de eventos',
  icon: 'IconCalendarEvent',
  relationTargetObjectMetadataUniversalIdentifier: EVENT_CATALOG_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: EVENT_CATALOG_COMPANY_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: { relationType: RelationType.ONE_TO_MANY },
});
