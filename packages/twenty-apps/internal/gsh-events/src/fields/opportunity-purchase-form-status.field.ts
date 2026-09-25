import { defineField, FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';
import { PURCHASE_FORM_STATUS } from 'src/constants/domain-options';
import { OPPORTUNITY_PURCHASE_FORM_STATUS_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export const PURCHASE_FORM_STATUS_OPTIONS = [
  { id: 'de3cc878-a389-4f46-97a7-edf6f0e53095', value: PURCHASE_FORM_STATUS.NOT_STARTED, label: 'Não iniciado', position: 0, color: 'gray' as const },
  { id: '92b5c62b-50fe-4904-a0fc-4156a9b56b19', value: PURCHASE_FORM_STATUS.SENT, label: 'Enviado', position: 1, color: 'yellow' as const },
  { id: 'be985103-78e2-4fd3-9633-03daa6d01035', value: PURCHASE_FORM_STATUS.COMPLETED, label: 'Concluído', position: 2, color: 'green' as const },
];

export default defineField({
  universalIdentifier: OPPORTUNITY_PURCHASE_FORM_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: FieldType.SELECT,
  name: 'purchaseFormStatus',
  label: 'Ficha de compras',
  icon: 'IconClipboardList',
  defaultValue: `'${PURCHASE_FORM_STATUS.NOT_STARTED}'`,
  options: PURCHASE_FORM_STATUS_OPTIONS,
});
