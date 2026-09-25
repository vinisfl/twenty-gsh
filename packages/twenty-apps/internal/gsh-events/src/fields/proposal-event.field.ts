import { defineField, FieldType, OnDeleteAction, RelationType } from 'twenty-sdk/define';
import { EVENT_OBJECT_UNIVERSAL_IDENTIFIER, EVENT_PROPOSALS_FIELD_UNIVERSAL_IDENTIFIER, PROPOSAL_EVENT_FIELD_UNIVERSAL_IDENTIFIER, PROPOSAL_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: PROPOSAL_EVENT_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: PROPOSAL_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'corporateEvent',
  label: 'Evento',
  icon: 'IconCalendarEvent',
  relationTargetObjectMetadataUniversalIdentifier: EVENT_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: EVENT_PROPOSALS_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: { relationType: RelationType.MANY_TO_ONE, onDelete: OnDeleteAction.SET_NULL, joinColumnName: 'corporateEventId' },
});
