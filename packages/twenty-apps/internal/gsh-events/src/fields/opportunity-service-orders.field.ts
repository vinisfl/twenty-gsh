import { defineField, FieldType, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';
import { OPPORTUNITY_SERVICE_ORDERS_FIELD_UNIVERSAL_IDENTIFIER, SERVICE_ORDER_OBJECT_UNIVERSAL_IDENTIFIER, SERVICE_ORDER_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: OPPORTUNITY_SERVICE_ORDERS_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: FieldType.RELATION,
  name: 'eventServiceOrders',
  label: 'Ordens de serviço',
  icon: 'IconClipboardCheck',
  relationTargetObjectMetadataUniversalIdentifier: SERVICE_ORDER_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: SERVICE_ORDER_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: { relationType: RelationType.ONE_TO_MANY },
});
