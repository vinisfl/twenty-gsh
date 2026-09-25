import { defineField, FieldType, RelationType } from 'twenty-sdk/define';
import { EVENT_OBJECT_UNIVERSAL_IDENTIFIER, EVENT_PROPOSALS_FIELD_UNIVERSAL_IDENTIFIER, PROPOSAL_EVENT_FIELD_UNIVERSAL_IDENTIFIER, PROPOSAL_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: EVENT_PROPOSALS_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: EVENT_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'proposals',
  label: 'Propostas',
  icon: 'IconFileInvoice',
  relationTargetObjectMetadataUniversalIdentifier: PROPOSAL_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: PROPOSAL_EVENT_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: { relationType: RelationType.ONE_TO_MANY },
});
