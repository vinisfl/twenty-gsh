import { defineField, FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';
import { OPPORTUNITY_ACCEPTANCE_EVIDENCE_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: OPPORTUNITY_ACCEPTANCE_EVIDENCE_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: FieldType.TEXT,
  name: 'eventAcceptanceEvidence',
  label: 'Evidência do aceite',
  description: 'Resumo ou link da mensagem/documento que registra o aceite.',
  icon: 'IconCircleCheck',
  isNullable: true,
});
