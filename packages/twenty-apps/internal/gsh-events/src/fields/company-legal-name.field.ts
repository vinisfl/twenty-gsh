import { defineField, FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';
import { COMPANY_LEGAL_NAME_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: COMPANY_LEGAL_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  type: FieldType.TEXT,
  name: 'legalName',
  label: 'Razão social',
  icon: 'IconBuilding',
  isNullable: true,
});
