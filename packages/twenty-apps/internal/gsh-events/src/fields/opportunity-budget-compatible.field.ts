import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { OPPORTUNITY_BUDGET_COMPATIBLE_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: OPPORTUNITY_BUDGET_COMPATIBLE_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: FieldType.BOOLEAN,
  name: 'eventBudgetCompatible',
  label: 'Orçamento compatível',
  description: 'Confirma que o orçamento estimado é compatível com o evento.',
  icon: 'IconCurrencyReal',
  defaultValue: false,
});
