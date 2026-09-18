import {
  AggregateOperations,
  defineView,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  ViewFilterOperand,
  ViewType,
} from 'twenty-sdk/define';

import { EVENT_PROCESS_STAGE } from 'src/constants/domain-options';
import { EVENT_PROCESS_STAGE_OPTIONS } from 'src/fields/opportunity-process-stage.field';
import {
  OPPORTUNITY_CURRENT_PENDING_FIELD_UNIVERSAL_IDENTIFIER,
  OPPORTUNITY_EVENT_AT_FIELD_UNIVERSAL_IDENTIFIER,
  OPPORTUNITY_GSH_FUNNEL_FIELD_UNIVERSAL_IDENTIFIER,
  OPPORTUNITY_LOCATION_FIELD_UNIVERSAL_IDENTIFIER,
  OPPORTUNITY_MODALITY_FIELD_UNIVERSAL_IDENTIFIER,
  OPPORTUNITY_NEXT_ACTION_AT_FIELD_UNIVERSAL_IDENTIFIER,
  OPPORTUNITY_NEXT_ACTION_FIELD_UNIVERSAL_IDENTIFIER,
  OPPORTUNITY_PROCESS_STAGE_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export const ACTIVE_EVENTS_VIEW_UNIVERSAL_IDENTIFIER =
  'f1f2d387-bcad-4b5e-b6c2-b7c15584f7e5';

const opportunityFields =
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.fields;
const groupIds = [
  'c745811c-b50c-4c97-afd2-79e37c24cc91',
  'e6bcc0d9-7c73-46cb-af55-334b09a4c95a',
  '64785b39-bef4-411f-a450-55178d0e465b',
  'f3f6f1ce-f006-48de-aa31-ab6aa2fe3628',
  'b30e4ba0-5607-48de-b7ba-dd437af11e03',
  '6c7bed9c-50df-4610-a260-881cc13cec3d',
  '2c1542a5-23a2-4619-9663-3a50ddefc940',
  '3a39ec79-7f94-4f25-8740-4ff4ac579159',
];

export default defineView({
  universalIdentifier: ACTIVE_EVENTS_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Funil de eventos',
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: ViewType.KANBAN,
  icon: 'IconLayoutKanban',
  position: 0,
  mainGroupByFieldMetadataUniversalIdentifier:
    OPPORTUNITY_PROCESS_STAGE_FIELD_UNIVERSAL_IDENTIFIER,
  kanbanAggregateOperation: AggregateOperations.COUNT_AND_SUM,
  kanbanAggregateOperationFieldMetadataUniversalIdentifier:
    opportunityFields.amount.universalIdentifier,
  groups: EVENT_PROCESS_STAGE_OPTIONS.map((option, index) => ({
    universalIdentifier: groupIds[index],
    fieldValue: option.value,
    position: index,
    isVisible: true,
  })),
  fields: [
    {
      universalIdentifier: 'b1cf661a-e597-4d9c-801c-2d5f4baf153d',
      fieldMetadataUniversalIdentifier:
        opportunityFields.name.universalIdentifier,
      position: 0,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '6d4a6aae-be48-4687-ac9f-f58d8773da87',
      fieldMetadataUniversalIdentifier:
        opportunityFields.amount.universalIdentifier,
      position: 1,
      isVisible: true,
      size: 140,
    },
    {
      universalIdentifier: 'd7e7318a-c38b-4326-99a1-f72c4b5bea12',
      fieldMetadataUniversalIdentifier:
        OPPORTUNITY_EVENT_AT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: false,
      size: 160,
    },
    {
      universalIdentifier: '80a8810c-f860-4da3-91a7-eab14c4d1237',
      fieldMetadataUniversalIdentifier:
        OPPORTUNITY_LOCATION_FIELD_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: false,
      size: 180,
    },
    {
      universalIdentifier: '77b4623d-80e9-4de7-87ee-af00ab175ec1',
      fieldMetadataUniversalIdentifier:
        OPPORTUNITY_MODALITY_FIELD_UNIVERSAL_IDENTIFIER,
      position: 4,
      isVisible: false,
      size: 160,
    },
    {
      universalIdentifier: '420e5bc1-8644-4d27-94b2-f5e2d94ce25d',
      fieldMetadataUniversalIdentifier:
        OPPORTUNITY_NEXT_ACTION_FIELD_UNIVERSAL_IDENTIFIER,
      position: 5,
      isVisible: true,
      size: 200,
    },
    {
      universalIdentifier: '2872b351-9ade-42a5-b431-06e823447917',
      fieldMetadataUniversalIdentifier:
        OPPORTUNITY_NEXT_ACTION_AT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 6,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: 'b96f28bc-5862-4dbb-ab54-0f5368f222e9',
      fieldMetadataUniversalIdentifier:
        OPPORTUNITY_CURRENT_PENDING_FIELD_UNIVERSAL_IDENTIFIER,
      position: 7,
      isVisible: false,
      size: 200,
    },
  ],
  filters: [
    {
      universalIdentifier: 'be254e6d-7f28-4b67-8f45-0758af312ccd',
      fieldMetadataUniversalIdentifier:
        OPPORTUNITY_GSH_FUNNEL_FIELD_UNIVERSAL_IDENTIFIER,
      operand: ViewFilterOperand.IS,
      value: ['CORPORATE_EVENT'],
    },
    {
      universalIdentifier: '07471dee-c3a2-461b-b192-5a3c28a48d75',
      fieldMetadataUniversalIdentifier:
        OPPORTUNITY_PROCESS_STAGE_FIELD_UNIVERSAL_IDENTIFIER,
      operand: ViewFilterOperand.IS,
      value: [
        EVENT_PROCESS_STAGE.ENTRY,
        EVENT_PROCESS_STAGE.QUALIFICATION,
        EVENT_PROCESS_STAGE.PROPOSAL_NEGOTIATION,
        EVENT_PROCESS_STAGE.ACCEPTANCE_REGISTRATION,
        EVENT_PROCESS_STAGE.PRODUCTION_FORMALIZATION_EVENT,
        EVENT_PROCESS_STAGE.CLOSED,
        EVENT_PROCESS_STAGE.LOST,
        EVENT_PROCESS_STAGE.CANCELLED,
      ],
    },
  ],
});
