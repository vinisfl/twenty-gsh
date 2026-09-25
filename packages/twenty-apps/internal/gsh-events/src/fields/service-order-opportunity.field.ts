import { defineField, FieldType, OnDeleteAction, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';
import { OPPORTUNITY_SERVICE_ORDERS_FIELD_UNIVERSAL_IDENTIFIER, SERVICE_ORDER_OBJECT_UNIVERSAL_IDENTIFIER, SERVICE_ORDER_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: SERVICE_ORDER_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: SERVICE_ORDER_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'opportunity',
  label: 'Oportunidade',
  icon: 'IconTargetArrow',
  relationTargetObjectMetadataUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier: OPPORTUNITY_SERVICE_ORDERS_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: { relationType: RelationType.MANY_TO_ONE, onDelete: OnDeleteAction.CASCADE, joinColumnName: 'opportunityId' },
});
