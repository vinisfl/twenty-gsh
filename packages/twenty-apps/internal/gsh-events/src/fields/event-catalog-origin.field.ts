import { defineField, FieldType } from 'twenty-sdk/define';

import { EVENT_CATALOG_ORIGIN } from 'src/constants/domain-options';
import { EVENT_CATALOG_OBJECT_UNIVERSAL_IDENTIFIER, EVENT_CATALOG_ORIGIN_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: EVENT_CATALOG_ORIGIN_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: EVENT_CATALOG_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.SELECT,
  name: 'origin',
  label: 'Origem',
  icon: 'IconTag',
  defaultValue: `'${EVENT_CATALOG_ORIGIN.EXTERNAL}'`,
  options: [
    { id: 'effb89ec-c8e9-40ad-8cdd-f88819dbabdc', value: EVENT_CATALOG_ORIGIN.INTERNAL, label: 'Interno', position: 0, color: 'blue' },
    { id: 'de56daa0-950e-4f6f-9302-6d21ce795efa', value: EVENT_CATALOG_ORIGIN.EXTERNAL, label: 'Externo', position: 1, color: 'orange' },
  ],
});
