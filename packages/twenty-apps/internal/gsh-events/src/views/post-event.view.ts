import { defineView, ViewFilterOperand, ViewType } from 'twenty-sdk/define';
import { EVENT_EXECUTION_STATUS_FIELD_UNIVERSAL_IDENTIFIER, EVENT_FEEDBACK_FIELD_UNIVERSAL_IDENTIFIER, EVENT_FEEDBACK_STATUS_FIELD_UNIVERSAL_IDENTIFIER, EVENT_LOCATION_FIELD_UNIVERSAL_IDENTIFIER, EVENT_NAME_FIELD_UNIVERSAL_IDENTIFIER, EVENT_OBJECT_UNIVERSAL_IDENTIFIER, EVENT_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER, EVENT_START_AT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export const POST_EVENT_VIEW_UNIVERSAL_IDENTIFIER =
  '1070e18d-ea86-4a2d-87cf-4c85349c5d9f';

export default defineView({
  universalIdentifier: POST_EVENT_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Pós-evento',
  objectUniversalIdentifier: EVENT_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  icon: 'IconMessageCircle',
  position: 1,
  fields: [
    { universalIdentifier: '27750f86-0f56-4878-bae8-44a837cb43d8', fieldMetadataUniversalIdentifier: EVENT_NAME_FIELD_UNIVERSAL_IDENTIFIER, position: 0, isVisible: true, size: 220 },
    { universalIdentifier: '121971aa-b8a9-499e-86c0-d0087c75496c', fieldMetadataUniversalIdentifier: EVENT_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER, position: 1, isVisible: true, size: 200 },
    { universalIdentifier: '3a054c9f-29b6-4e51-aae3-759aa251d488', fieldMetadataUniversalIdentifier: EVENT_START_AT_FIELD_UNIVERSAL_IDENTIFIER, position: 2, isVisible: true, size: 160 },
    { universalIdentifier: '02dee76f-d84b-4b32-adea-f479eacf60a5', fieldMetadataUniversalIdentifier: EVENT_LOCATION_FIELD_UNIVERSAL_IDENTIFIER, position: 3, isVisible: true, size: 180 },
    { universalIdentifier: '60905ebe-2e4d-4b4e-90a2-281696af9344', fieldMetadataUniversalIdentifier: EVENT_FEEDBACK_STATUS_FIELD_UNIVERSAL_IDENTIFIER, position: 4, isVisible: true, size: 150 },
    { universalIdentifier: '3436ebbc-3bf9-4b54-a386-d72fff7dadfb', fieldMetadataUniversalIdentifier: EVENT_FEEDBACK_FIELD_UNIVERSAL_IDENTIFIER, position: 5, isVisible: true, size: 240 },
  ],
  filters: [
    { universalIdentifier: '853fc9c2-d784-47c7-a7a7-3aad5c04a5b9', fieldMetadataUniversalIdentifier: EVENT_EXECUTION_STATUS_FIELD_UNIVERSAL_IDENTIFIER, operand: ViewFilterOperand.IS, value: ['COMPLETED'] },
    { universalIdentifier: '03b18b05-cf23-4aa9-bd57-63e4c5a9c7d9', fieldMetadataUniversalIdentifier: EVENT_FEEDBACK_STATUS_FIELD_UNIVERSAL_IDENTIFIER, operand: ViewFilterOperand.IS, value: ['PENDING', 'REQUESTED'] },
  ],
});
