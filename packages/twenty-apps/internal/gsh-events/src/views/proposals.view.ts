import { defineView, ViewType } from 'twenty-sdk/define';
import { PROPOSAL_NAME_FIELD_UNIVERSAL_IDENTIFIER, PROPOSAL_OBJECT_UNIVERSAL_IDENTIFIER, PROPOSAL_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER, PROPOSAL_SENT_AT_FIELD_UNIVERSAL_IDENTIFIER, PROPOSAL_STATUS_FIELD_UNIVERSAL_IDENTIFIER, PROPOSAL_TOTAL_FIELD_UNIVERSAL_IDENTIFIER, PROPOSAL_VALID_UNTIL_FIELD_UNIVERSAL_IDENTIFIER, PROPOSAL_VERSION_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export const PROPOSALS_VIEW_UNIVERSAL_IDENTIFIER =
  'bd6d36e2-3fcc-4ce0-9cfd-8675b9b97c6e';

export default defineView({
  universalIdentifier: PROPOSALS_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Propostas de eventos',
  objectUniversalIdentifier: PROPOSAL_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  icon: 'IconFileInvoice',
  position: 0,
  fields: [
    { universalIdentifier: 'c8524ef4-3ceb-4337-8ce9-6198916bdd14', fieldMetadataUniversalIdentifier: PROPOSAL_NAME_FIELD_UNIVERSAL_IDENTIFIER, position: 0, isVisible: true, size: 220 },
    { universalIdentifier: '39fe470e-9f51-4c31-8dbd-c974e7db9559', fieldMetadataUniversalIdentifier: PROPOSAL_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER, position: 1, isVisible: true, size: 200 },
    { universalIdentifier: '94463095-c2a8-42de-ac7a-9bf4cefc78d1', fieldMetadataUniversalIdentifier: PROPOSAL_VERSION_FIELD_UNIVERSAL_IDENTIFIER, position: 2, isVisible: true, size: 100 },
    { universalIdentifier: '169e1deb-6852-4189-95db-c8a4d309342b', fieldMetadataUniversalIdentifier: PROPOSAL_STATUS_FIELD_UNIVERSAL_IDENTIFIER, position: 3, isVisible: true, size: 140 },
    { universalIdentifier: '483754c9-0d65-4e7b-a127-8e5e83b10468', fieldMetadataUniversalIdentifier: PROPOSAL_TOTAL_FIELD_UNIVERSAL_IDENTIFIER, position: 4, isVisible: true, size: 140 },
    { universalIdentifier: '123638eb-6559-46eb-8036-4a1b80c175fb', fieldMetadataUniversalIdentifier: PROPOSAL_VALID_UNTIL_FIELD_UNIVERSAL_IDENTIFIER, position: 5, isVisible: true, size: 150 },
    { universalIdentifier: 'e625c031-072e-4a0c-b9f1-6315c9a6e783', fieldMetadataUniversalIdentifier: PROPOSAL_SENT_AT_FIELD_UNIVERSAL_IDENTIFIER, position: 6, isVisible: true, size: 150 },
  ],
});
