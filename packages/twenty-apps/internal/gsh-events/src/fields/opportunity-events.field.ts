import { defineField, FieldType, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';
import { EVENT_OBJECT_UNIVERSAL_IDENTIFIER, EVENT_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER, OPPORTUNITY_EVENTS_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: OPPORTUNITY_EVENTS_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: FieldType.RELATION,
  name: 'corporateEvents',
  label: 'Eventos',
  icon: 'IconCalendarEvent',
  relationTargetObjectMetadataUniversalIdentifier: EVENT_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: EVENT_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: { relationType: RelationType.ONE_TO_MANY },
});
