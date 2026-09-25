import { defineField, FieldType, OnDeleteAction, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';
import { EVENT_OBJECT_UNIVERSAL_IDENTIFIER, EVENT_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER, OPPORTUNITY_EVENTS_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: EVENT_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: EVENT_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'opportunity',
  label: 'Oportunidade',
  icon: 'IconTargetArrow',
  relationTargetObjectMetadataUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier: OPPORTUNITY_EVENTS_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: { relationType: RelationType.MANY_TO_ONE, onDelete: OnDeleteAction.CASCADE, joinColumnName: 'opportunityId' },
});
