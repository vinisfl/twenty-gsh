import { defineField, FieldType, OnDeleteAction, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';
import { EVENT_CATALOG_OBJECT_UNIVERSAL_IDENTIFIER, EVENT_CATALOG_OPPORTUNITIES_FIELD_UNIVERSAL_IDENTIFIER, OPPORTUNITY_EVENT_CATALOG_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: OPPORTUNITY_EVENT_CATALOG_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: FieldType.RELATION,
  name: 'eventCatalog',
  label: 'Evento',
  icon: 'IconCalendarEvent',
  isNullable: true,
  relationTargetObjectMetadataUniversalIdentifier: EVENT_CATALOG_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: EVENT_CATALOG_OPPORTUNITIES_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: { relationType: RelationType.MANY_TO_ONE, onDelete: OnDeleteAction.SET_NULL, joinColumnName: 'eventCatalogId' },
});
