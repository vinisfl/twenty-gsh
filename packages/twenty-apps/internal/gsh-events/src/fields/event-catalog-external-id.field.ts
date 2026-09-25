import { defineField, FieldType } from 'twenty-sdk/define';

import { EVENT_CATALOG_EXTERNAL_ID_FIELD_UNIVERSAL_IDENTIFIER, EVENT_CATALOG_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

// Holds gld_dim_evento.evento_sk for events imported from the Databricks
// gold layer — the stable key the sync job upserts on. Null for events
// created ad hoc through the commercial flow (origin = EXTERNAL).
export default defineField({
  universalIdentifier: EVENT_CATALOG_EXTERNAL_ID_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: EVENT_CATALOG_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.TEXT,
  name: 'externalId',
  label: 'ID externo',
  icon: 'IconHash',
  isNullable: true,
  isUnique: true,
});
