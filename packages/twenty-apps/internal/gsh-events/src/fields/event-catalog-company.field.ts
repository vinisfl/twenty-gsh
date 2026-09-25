import { defineField, FieldType, OnDeleteAction, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';
import { COMPANY_EVENT_CATALOGS_FIELD_UNIVERSAL_IDENTIFIER, EVENT_CATALOG_COMPANY_FIELD_UNIVERSAL_IDENTIFIER, EVENT_CATALOG_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: EVENT_CATALOG_COMPANY_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: EVENT_CATALOG_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'company',
  label: 'Empresa vinculada',
  icon: 'IconBuilding',
  isNullable: true,
  relationTargetObjectMetadataUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier: COMPANY_EVENT_CATALOGS_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: { relationType: RelationType.MANY_TO_ONE, onDelete: OnDeleteAction.SET_NULL, joinColumnName: 'companyId' },
});
