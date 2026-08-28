import { defineView, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS, ViewFilterOperand, ViewType } from 'twenty-sdk/define';
import { EVENT_PROCESS_STAGE } from 'src/constants/domain-options';
import { OPPORTUNITY_CLOSED_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER, OPPORTUNITY_EVENT_AT_FIELD_UNIVERSAL_IDENTIFIER, OPPORTUNITY_GSH_FUNNEL_FIELD_UNIVERSAL_IDENTIFIER, OPPORTUNITY_LOSS_REASON_FIELD_UNIVERSAL_IDENTIFIER, OPPORTUNITY_PROCESS_STAGE_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export const CLOSED_EVENTS_VIEW_UNIVERSAL_IDENTIFIER =
  '4d7dc67d-8a81-4be0-92d7-f9d23ba42e76';
const fields = STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.fields;

export default defineView({
  universalIdentifier: CLOSED_EVENTS_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Eventos encerrados',
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: ViewType.TABLE,
  icon: 'IconArchive',
  position: 2,
  fields: [
    { universalIdentifier: 'dc5c877f-3786-4baa-91a2-4ab41b81d524', fieldMetadataUniversalIdentifier: fields.name.universalIdentifier, position: 0, isVisible: true, size: 220 },
    { universalIdentifier: 'f5d4c60e-6ece-4d9f-a410-eaf342bb5f1c', fieldMetadataUniversalIdentifier: OPPORTUNITY_PROCESS_STAGE_FIELD_UNIVERSAL_IDENTIFIER, position: 1, isVisible: true, size: 160 },
    { universalIdentifier: 'df72239c-720c-4b28-a536-bae0dddcc363', fieldMetadataUniversalIdentifier: OPPORTUNITY_CLOSED_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER, position: 2, isVisible: true, size: 140 },
    { universalIdentifier: '507b5e3a-ba24-4a8e-a244-f0ad0294297a', fieldMetadataUniversalIdentifier: OPPORTUNITY_EVENT_AT_FIELD_UNIVERSAL_IDENTIFIER, position: 3, isVisible: true, size: 160 },
    { universalIdentifier: 'a9514a42-edd4-4b93-9c98-e4e743b8422c', fieldMetadataUniversalIdentifier: OPPORTUNITY_LOSS_REASON_FIELD_UNIVERSAL_IDENTIFIER, position: 4, isVisible: true, size: 180 },
  ],
  filters: [
    { universalIdentifier: '623b7c7c-c08b-4ecd-9cde-30570323b808', fieldMetadataUniversalIdentifier: OPPORTUNITY_GSH_FUNNEL_FIELD_UNIVERSAL_IDENTIFIER, operand: ViewFilterOperand.IS, value: ['CORPORATE_EVENT'] },
    { universalIdentifier: '10feee19-1b6f-401b-8000-acbd3f723807', fieldMetadataUniversalIdentifier: OPPORTUNITY_PROCESS_STAGE_FIELD_UNIVERSAL_IDENTIFIER, operand: ViewFilterOperand.IS, value: [EVENT_PROCESS_STAGE.CLOSED, EVENT_PROCESS_STAGE.LOST, EVENT_PROCESS_STAGE.CANCELLED] },
  ],
});
