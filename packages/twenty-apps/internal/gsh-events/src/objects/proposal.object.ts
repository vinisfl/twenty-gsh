import { defineObject, FieldType } from 'twenty-sdk/define';

import { PROPOSAL_STATUS } from 'src/constants/domain-options';
import {
  PROPOSAL_CHANGE_SUMMARY_FIELD_UNIVERSAL_IDENTIFIER,
  PROPOSAL_DOCUMENT_FIELD_UNIVERSAL_IDENTIFIER,
  PROPOSAL_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  PROPOSAL_OBJECT_UNIVERSAL_IDENTIFIER,
  PROPOSAL_PAYMENT_TERMS_FIELD_UNIVERSAL_IDENTIFIER,
  PROPOSAL_PER_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
  PROPOSAL_SENT_AT_FIELD_UNIVERSAL_IDENTIFIER,
  PROPOSAL_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  PROPOSAL_TOTAL_FIELD_UNIVERSAL_IDENTIFIER,
  PROPOSAL_VALID_UNTIL_FIELD_UNIVERSAL_IDENTIFIER,
  PROPOSAL_VERSION_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineObject({
  universalIdentifier: PROPOSAL_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'eventProposal',
  namePlural: 'eventProposals',
  labelSingular: 'Proposta',
  labelPlural: 'Propostas',
  description: 'Versão comercial enviada para um evento.',
  icon: 'IconFileInvoice',
  labelIdentifierFieldMetadataUniversalIdentifier:
    PROPOSAL_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    { universalIdentifier: PROPOSAL_NAME_FIELD_UNIVERSAL_IDENTIFIER, type: FieldType.TEXT, name: 'name', label: 'Título', icon: 'IconFileInvoice' },
    { universalIdentifier: PROPOSAL_VERSION_FIELD_UNIVERSAL_IDENTIFIER, type: FieldType.NUMBER, name: 'version', label: 'Versão', icon: 'IconVersions', isNullable: true },
    {
      universalIdentifier: PROPOSAL_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      name: 'status',
      label: 'Status',
      icon: 'IconProgress',
      defaultValue: `'${PROPOSAL_STATUS.DRAFT}'`,
      options: [
        { id: '59b02012-212c-4c63-9329-d40f7be2caed', value: PROPOSAL_STATUS.DRAFT, label: 'Rascunho', position: 0, color: 'gray' },
        { id: 'bf78c30d-92ef-4a8e-b894-4242784a2829', value: PROPOSAL_STATUS.SENT, label: 'Enviada', position: 1, color: 'blue' },
        { id: 'a4a28539-8e0b-412e-97a5-6939414a9177', value: PROPOSAL_STATUS.SUPERSEDED, label: 'Substituída', position: 2, color: 'yellow' },
        { id: '63e9d5cf-9cd6-4b64-a4f8-9687195877a6', value: PROPOSAL_STATUS.ACCEPTED, label: 'Aceita', position: 3, color: 'green' },
        { id: 'b1dd38e4-7ff6-4f0e-a176-75974a4a50a9', value: PROPOSAL_STATUS.REJECTED, label: 'Recusada', position: 4, color: 'red' },
      ],
    },
    { universalIdentifier: PROPOSAL_TOTAL_FIELD_UNIVERSAL_IDENTIFIER, type: FieldType.CURRENCY, name: 'total', label: 'Valor total', icon: 'IconCurrencyReal', isNullable: true },
    { universalIdentifier: PROPOSAL_PER_PERSON_FIELD_UNIVERSAL_IDENTIFIER, type: FieldType.CURRENCY, name: 'perPerson', label: 'Valor por pessoa', icon: 'IconCurrencyReal', isNullable: true },
    { universalIdentifier: PROPOSAL_VALID_UNTIL_FIELD_UNIVERSAL_IDENTIFIER, type: FieldType.DATE_TIME, name: 'validUntil', label: 'Validade', icon: 'IconCalendarDue', isNullable: true },
    { universalIdentifier: PROPOSAL_PAYMENT_TERMS_FIELD_UNIVERSAL_IDENTIFIER, type: FieldType.RICH_TEXT, name: 'paymentTerms', label: 'Condições de pagamento', icon: 'IconCreditCard', isNullable: true },
    { universalIdentifier: PROPOSAL_DOCUMENT_FIELD_UNIVERSAL_IDENTIFIER, type: FieldType.TEXT, name: 'documentUrl', label: 'Link do documento', icon: 'IconLink', isNullable: true },
    { universalIdentifier: PROPOSAL_SENT_AT_FIELD_UNIVERSAL_IDENTIFIER, type: FieldType.DATE_TIME, name: 'sentAt', label: 'Enviada em', icon: 'IconSend', isNullable: true },
    { universalIdentifier: PROPOSAL_CHANGE_SUMMARY_FIELD_UNIVERSAL_IDENTIFIER, type: FieldType.RICH_TEXT, name: 'changeSummary', label: 'Alterações desta versão', icon: 'IconNotes', isNullable: true },
  ],
});
