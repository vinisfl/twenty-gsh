import { defineField, FieldType } from 'twenty-sdk/define';

import { EVENT_CATALOG_EXPECTED_REVENUE_FIELD_UNIVERSAL_IDENTIFIER, EVENT_CATALOG_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: EVENT_CATALOG_EXPECTED_REVENUE_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: EVENT_CATALOG_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.CURRENCY,
  name: 'expectedRevenue',
  label: 'Receita prevista',
  icon: 'IconCurrencyReal',
  isNullable: true,
});
