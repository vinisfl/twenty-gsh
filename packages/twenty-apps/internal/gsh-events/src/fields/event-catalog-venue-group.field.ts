import { defineField, FieldType } from 'twenty-sdk/define';

import { EVENT_CATALOG_OBJECT_UNIVERSAL_IDENTIFIER, EVENT_CATALOG_VENUE_GROUP_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

// The real physical venue group (e.g. Arena MRV, Nubank Arena, Qualistage),
// resolved by the sync job from gld_fct_vendas.venue_sk -> gld_dim_venue —
// not gld_dim_evento.venue_grupo, which is a sponsorship/campaign name.
export default defineField({
  universalIdentifier: EVENT_CATALOG_VENUE_GROUP_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: EVENT_CATALOG_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.TEXT,
  name: 'venueGroup',
  label: 'Grupo de venue',
  icon: 'IconMapPin',
  isNullable: true,
});
