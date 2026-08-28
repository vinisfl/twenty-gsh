import { defineView, ViewFilterOperand, ViewType } from 'twenty-sdk/define';
import { SERVICE_ORDER_DISTRIBUTED_AT_FIELD_UNIVERSAL_IDENTIFIER, SERVICE_ORDER_DISTRIBUTION_STATUS_FIELD_UNIVERSAL_IDENTIFIER, SERVICE_ORDER_EVENT_AT_FIELD_UNIVERSAL_IDENTIFIER, SERVICE_ORDER_NAME_FIELD_UNIVERSAL_IDENTIFIER, SERVICE_ORDER_OBJECT_UNIVERSAL_IDENTIFIER, SERVICE_ORDER_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER, SERVICE_ORDER_RESPONSIBLE_FIELD_UNIVERSAL_IDENTIFIER, SERVICE_ORDER_STATUS_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export const SERVICE_ORDERS_VIEW_UNIVERSAL_IDENTIFIER =
  'e10d0695-ab2e-4933-9054-2fac6579f18e';

export default defineView({
  universalIdentifier: SERVICE_ORDERS_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'OS da semana',
  objectUniversalIdentifier: SERVICE_ORDER_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  icon: 'IconClipboardCheck',
  position: 0,
  fields: [
    { universalIdentifier: '2b300763-9cf4-4e9a-a1a6-125c6e699590', fieldMetadataUniversalIdentifier: SERVICE_ORDER_NAME_FIELD_UNIVERSAL_IDENTIFIER, position: 0, isVisible: true, size: 220 },
    { universalIdentifier: '7d0c4164-abf3-47fe-86f9-2b68b7c68bd2', fieldMetadataUniversalIdentifier: SERVICE_ORDER_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER, position: 1, isVisible: true, size: 200 },
    { universalIdentifier: 'fb8c01d7-3bda-494c-8a3d-c82881b907cb', fieldMetadataUniversalIdentifier: SERVICE_ORDER_STATUS_FIELD_UNIVERSAL_IDENTIFIER, position: 2, isVisible: true, size: 150 },
    { universalIdentifier: '2317ab1e-142d-42e9-aac3-54c7b3291f9b', fieldMetadataUniversalIdentifier: SERVICE_ORDER_RESPONSIBLE_FIELD_UNIVERSAL_IDENTIFIER, position: 3, isVisible: true, size: 180 },
    { universalIdentifier: '8b33d785-5610-4709-a9c1-f14b2943d64b', fieldMetadataUniversalIdentifier: SERVICE_ORDER_EVENT_AT_FIELD_UNIVERSAL_IDENTIFIER, position: 4, isVisible: true, size: 160 },
    { universalIdentifier: 'eef7d323-3508-48b8-8f19-836d1405aa6e', fieldMetadataUniversalIdentifier: SERVICE_ORDER_DISTRIBUTED_AT_FIELD_UNIVERSAL_IDENTIFIER, position: 5, isVisible: true, size: 160 },
    { universalIdentifier: '3009d648-9bc2-418f-ae09-8f8a910a1eda', fieldMetadataUniversalIdentifier: SERVICE_ORDER_DISTRIBUTION_STATUS_FIELD_UNIVERSAL_IDENTIFIER, position: 6, isVisible: true, size: 160 },
  ],
  filters: [
    { universalIdentifier: '91d9d16f-0b23-42b8-9ad6-c58d0d6c6e77', fieldMetadataUniversalIdentifier: SERVICE_ORDER_STATUS_FIELD_UNIVERSAL_IDENTIFIER, operand: ViewFilterOperand.IS, value: ['ISSUED', 'DISTRIBUTED'] },
    { universalIdentifier: 'b6624782-606a-4930-8f4d-158fdcfda000', fieldMetadataUniversalIdentifier: SERVICE_ORDER_EVENT_AT_FIELD_UNIVERSAL_IDENTIFIER, operand: ViewFilterOperand.IS_RELATIVE, value: 'THIS_1_WEEK' },
  ],
});
