import { defineField, FieldType, RelationType } from 'twenty-sdk/define';
import { EVENT_OBJECT_UNIVERSAL_IDENTIFIER, EVENT_SERVICE_ORDERS_FIELD_UNIVERSAL_IDENTIFIER, SERVICE_ORDER_EVENT_FIELD_UNIVERSAL_IDENTIFIER, SERVICE_ORDER_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: EVENT_SERVICE_ORDERS_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: EVENT_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'serviceOrders',
  label: 'Ordens de serviço',
  icon: 'IconClipboardCheck',
  relationTargetObjectMetadataUniversalIdentifier: SERVICE_ORDER_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: SERVICE_ORDER_EVENT_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: { relationType: RelationType.ONE_TO_MANY },
});
