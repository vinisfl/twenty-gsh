import { defineField, FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';
import { INVOICE_STATUS } from 'src/constants/domain-options';
import { OPPORTUNITY_INVOICE_STATUS_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: OPPORTUNITY_INVOICE_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: FieldType.SELECT,
  name: 'invoiceStatus',
  label: 'Nota fiscal',
  icon: 'IconReceipt',
  defaultValue: `'${INVOICE_STATUS.NOT_REQUESTED}'`,
  options: [
    { id: 'adb84f4f-1a7d-4030-8fa5-f31e219781b8', value: INVOICE_STATUS.NOT_REQUESTED, label: 'Não solicitada', position: 0, color: 'gray' },
    { id: '3ac03dac-3427-44b7-8208-b432f5ca3361', value: INVOICE_STATUS.REQUESTED, label: 'Solicitada', position: 1, color: 'yellow' },
    { id: '0a211d8f-ea3d-4cd7-88f0-65079b712217', value: INVOICE_STATUS.ISSUED, label: 'Emitida', position: 2, color: 'green' },
  ],
});
