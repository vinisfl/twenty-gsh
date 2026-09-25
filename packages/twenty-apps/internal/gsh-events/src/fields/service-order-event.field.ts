import { defineField, FieldType, OnDeleteAction, RelationType } from 'twenty-sdk/define';
import { EVENT_OBJECT_UNIVERSAL_IDENTIFIER, EVENT_SERVICE_ORDERS_FIELD_UNIVERSAL_IDENTIFIER, SERVICE_ORDER_EVENT_FIELD_UNIVERSAL_IDENTIFIER, SERVICE_ORDER_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: SERVICE_ORDER_EVENT_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: SERVICE_ORDER_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'corporateEvent',
  label: 'Evento',
  icon: 'IconCalendarEvent',
  relationTargetObjectMetadataUniversalIdentifier: EVENT_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: EVENT_SERVICE_ORDERS_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: { relationType: RelationType.MANY_TO_ONE, onDelete: OnDeleteAction.SET_NULL, joinColumnName: 'corporateEventId' },
});
