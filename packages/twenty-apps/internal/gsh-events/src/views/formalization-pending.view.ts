import { defineView, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS, ViewFilterGroupLogicalOperator, ViewFilterOperand, ViewType } from 'twenty-sdk/define';
import { EVENT_PROCESS_STAGE } from 'src/constants/domain-options';
import { OPPORTUNITY_CONTRACT_STATUS_FIELD_UNIVERSAL_IDENTIFIER, OPPORTUNITY_CURRENT_PENDING_FIELD_UNIVERSAL_IDENTIFIER, OPPORTUNITY_CURRENT_SITUATION_FIELD_UNIVERSAL_IDENTIFIER, OPPORTUNITY_EVENT_AT_FIELD_UNIVERSAL_IDENTIFIER, OPPORTUNITY_GSH_FUNNEL_FIELD_UNIVERSAL_IDENTIFIER, OPPORTUNITY_INVOICE_STATUS_FIELD_UNIVERSAL_IDENTIFIER, OPPORTUNITY_PROCESS_STAGE_FIELD_UNIVERSAL_IDENTIFIER, OPPORTUNITY_PURCHASE_FORM_STATUS_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export const FORMALIZATION_PENDING_VIEW_UNIVERSAL_IDENTIFIER =
  '30460212-bddf-4f2a-95d7-24d34ac7bb43';
const fields = STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.fields;

export default defineView({
  universalIdentifier: FORMALIZATION_PENDING_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Formalização e produção',
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: ViewType.TABLE,
  icon: 'IconChecklist',
  position: 1,
  fields: [
    { universalIdentifier: '54511119-6960-4dbd-806e-cf904b89125a', fieldMetadataUniversalIdentifier: fields.name.universalIdentifier, position: 0, isVisible: true, size: 220 },
    { universalIdentifier: '5cb15dbb-f4d9-4148-aa8b-4307323c48c8', fieldMetadataUniversalIdentifier: OPPORTUNITY_EVENT_AT_FIELD_UNIVERSAL_IDENTIFIER, position: 1, isVisible: true, size: 160 },
    { universalIdentifier: '3401749f-c058-41cd-8996-0223a6d2f9f2', fieldMetadataUniversalIdentifier: OPPORTUNITY_CURRENT_SITUATION_FIELD_UNIVERSAL_IDENTIFIER, position: 2, isVisible: true, size: 210 },
    { universalIdentifier: '1cafbc46-eef0-473c-84a4-8ee0d27f0bf3', fieldMetadataUniversalIdentifier: OPPORTUNITY_PURCHASE_FORM_STATUS_FIELD_UNIVERSAL_IDENTIFIER, position: 3, isVisible: true, size: 150 },
    { universalIdentifier: '4da97888-b3c1-4c87-b9ab-d253948a190b', fieldMetadataUniversalIdentifier: OPPORTUNITY_INVOICE_STATUS_FIELD_UNIVERSAL_IDENTIFIER, position: 4, isVisible: true, size: 150 },
    { universalIdentifier: '027bf37b-0457-448c-9952-74781f4d1866', fieldMetadataUniversalIdentifier: OPPORTUNITY_CONTRACT_STATUS_FIELD_UNIVERSAL_IDENTIFIER, position: 5, isVisible: true, size: 150 },
    { universalIdentifier: 'c0be3034-7061-4d58-833c-5275090e0567', fieldMetadataUniversalIdentifier: OPPORTUNITY_CURRENT_PENDING_FIELD_UNIVERSAL_IDENTIFIER, position: 6, isVisible: true, size: 220 },
  ],
  filterGroups: [
    { universalIdentifier: '218c92a9-7186-4777-8ec0-a75a571a8875', logicalOperator: ViewFilterGroupLogicalOperator.AND },
    { universalIdentifier: '5eccaf51-9979-4b47-a887-dc948d691c26', logicalOperator: ViewFilterGroupLogicalOperator.OR, parentViewFilterGroupUniversalIdentifier: '218c92a9-7186-4777-8ec0-a75a571a8875', positionInViewFilterGroup: 2 },
  ],
  filters: [
    { universalIdentifier: '8a7b6311-86a6-43c3-8158-4706337c6a7b', fieldMetadataUniversalIdentifier: OPPORTUNITY_GSH_FUNNEL_FIELD_UNIVERSAL_IDENTIFIER, operand: ViewFilterOperand.IS, value: ['CORPORATE_EVENT'], viewFilterGroupUniversalIdentifier: '218c92a9-7186-4777-8ec0-a75a571a8875', positionInViewFilterGroup: 0 },
    { universalIdentifier: '28e284dc-ce5f-4e8d-8429-342c5bb2ead0', fieldMetadataUniversalIdentifier: OPPORTUNITY_PROCESS_STAGE_FIELD_UNIVERSAL_IDENTIFIER, operand: ViewFilterOperand.IS, value: [EVENT_PROCESS_STAGE.PRODUCTION_FORMALIZATION_EVENT], viewFilterGroupUniversalIdentifier: '218c92a9-7186-4777-8ec0-a75a571a8875', positionInViewFilterGroup: 1 },
    { universalIdentifier: '951c0fa7-c31e-40a5-94f2-dc22d15ccb1d', fieldMetadataUniversalIdentifier: OPPORTUNITY_INVOICE_STATUS_FIELD_UNIVERSAL_IDENTIFIER, operand: ViewFilterOperand.IS_NOT, value: ['ISSUED'], viewFilterGroupUniversalIdentifier: '5eccaf51-9979-4b47-a887-dc948d691c26', positionInViewFilterGroup: 0 },
    { universalIdentifier: '4aef022f-1f6e-41b7-a214-3c66a7f2250a', fieldMetadataUniversalIdentifier: OPPORTUNITY_CONTRACT_STATUS_FIELD_UNIVERSAL_IDENTIFIER, operand: ViewFilterOperand.IS_NOT, value: ['SIGNED'], viewFilterGroupUniversalIdentifier: '5eccaf51-9979-4b47-a887-dc948d691c26', positionInViewFilterGroup: 1 },
  ],
});
