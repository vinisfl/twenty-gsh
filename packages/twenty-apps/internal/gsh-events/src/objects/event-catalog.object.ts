import { defineObject, FieldType } from 'twenty-sdk/define';

import { EVENT_PROPERTY_TYPE } from 'src/constants/domain-options';
import {
  EVENT_CATALOG_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  EVENT_CATALOG_OBJECT_UNIVERSAL_IDENTIFIER,
  EVENT_CATALOG_PROPERTY_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineObject({
  universalIdentifier: EVENT_CATALOG_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'eventCatalog',
  namePlural: 'eventCatalogs',
  labelSingular: 'Evento',
  labelPlural: 'Eventos',
  description:
    'Propriedade ou franquia recorrente da GSH, compartilhável entre várias oportunidades.',
  icon: 'IconCalendarEvent',
  labelIdentifierFieldMetadataUniversalIdentifier:
    EVENT_CATALOG_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    { universalIdentifier: EVENT_CATALOG_NAME_FIELD_UNIVERSAL_IDENTIFIER, type: FieldType.TEXT, name: 'name', label: 'Nome do evento', icon: 'IconCalendarEvent' },
    {
      universalIdentifier: EVENT_CATALOG_PROPERTY_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      name: 'eventPropertyType',
      label: 'Tipo',
      icon: 'IconCategory',
      isNullable: true,
      options: [
        { id: '37cdc81e-0688-4139-8c5e-c5d2e7bc1c31', value: EVENT_PROPERTY_TYPE.CORPORATE, label: 'Corporativo', position: 0, color: 'blue' },
        { id: '2bfde8c4-5663-488e-a164-84f4df495c91', value: EVENT_PROPERTY_TYPE.GAME, label: 'Jogo', position: 1, color: 'green' },
        { id: '713ed837-9f2a-4cda-8bc7-4db7b60e9ddf', value: EVENT_PROPERTY_TYPE.SHOW, label: 'Show', position: 2, color: 'purple' },
        { id: 'b4f876ef-9d78-464c-9ba3-5c1f2b5316dd', value: EVENT_PROPERTY_TYPE.OTHER, label: 'Outro', position: 3, color: 'gray' },
      ],
    },
  ],
});
