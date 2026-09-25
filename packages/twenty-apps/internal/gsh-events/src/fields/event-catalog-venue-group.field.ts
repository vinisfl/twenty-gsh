import { defineField, FieldType } from 'twenty-sdk/define';

import { EVENT_CATALOG_VENUE_GROUP } from 'src/constants/domain-options';
import { EVENT_CATALOG_OBJECT_UNIVERSAL_IDENTIFIER, EVENT_CATALOG_VENUE_GROUP_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

// Grupo de venue/campanha da GSH (gld_dim_evento.venue_grupo) — closed list,
// not the physical venue from gld_dim_venue. See EVENT_CATALOG_VENUE_GROUP.
export default defineField({
  universalIdentifier: EVENT_CATALOG_VENUE_GROUP_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: EVENT_CATALOG_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.SELECT,
  name: 'venueGroup',
  label: 'Grupo de venue',
  icon: 'IconMapPin',
  isNullable: true,
  options: [
    { id: '37ccc838-7935-4629-b464-f2ba87d01cef', value: EVENT_CATALOG_VENUE_GROUP.ARENA_MRV, label: 'Arena MRV', position: 0, color: 'blue' },
    { id: 'bb62f694-6823-46a4-9ff3-9786ee465ab8', value: EVENT_CATALOG_VENUE_GROUP.CASA_COR_SP_2026, label: 'CASA COR SP 2026', position: 1, color: 'orange' },
    { id: 'ef533b4e-5f83-46a7-b495-3af07f142ea4', value: EVENT_CATALOG_VENUE_GROUP.ESPLANADA, label: 'Esplanada', position: 2, color: 'green' },
    { id: 'ad8b6a47-77ad-4aad-a119-e4275e4b15a9', value: EVENT_CATALOG_VENUE_GROUP.GSH_QUALISTAGE_RJ, label: 'GSH - QUALISTAGE RJ', position: 3, color: 'purple' },
    { id: 'e0a55e23-db5d-45c4-acd8-d6633a4c5c6e', value: EVENT_CATALOG_VENUE_GROUP.MORUMBIS_ANUAL_2026, label: 'MORUMBIS ANUAL 2026', position: 4, color: 'pink' },
    { id: '642764d2-5674-4109-8122-c7d2651bd29c', value: EVENT_CATALOG_VENUE_GROUP.NUBANK_ANUAL_26, label: 'NUBANK ANUAL 26', position: 5, color: 'cyan' },
    { id: '3213fd68-f99a-41ff-b168-211f919a3436', value: EVENT_CATALOG_VENUE_GROUP.NUBANK_TOUR, label: 'NUBANK TOUR', position: 6, color: 'turquoise' },
    { id: 'ce95bbfa-382f-4f9b-a021-802fad60f72a', value: EVENT_CATALOG_VENUE_GROUP.PARQUE_AGUA_BRANCA, label: 'PARQUE AGUA BRANCA', position: 7, color: 'yellow' },
    { id: 'd0847245-6b82-4cad-9f2c-517a0a7fc694', value: EVENT_CATALOG_VENUE_GROUP.PARQUE_VILLA_LOBOS, label: 'PARQUE VILLA LOBOS', position: 8, color: 'red' },
    { id: '46d714f5-e496-4e07-af81-c225868ad3fd', value: EVENT_CATALOG_VENUE_GROUP.PRO_MAGNO, label: 'Pro Magno', position: 9, color: 'gray' },
    { id: 'a6e223b5-d645-4fc0-b0cd-242d7158824f', value: EVENT_CATALOG_VENUE_GROUP.SUHAI_MUSIC_HALL, label: 'SUHAI MUSIC HALL', position: 10, color: 'sky' },
  ],
});
