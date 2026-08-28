import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';
import { ACTIVE_EVENTS_VIEW_UNIVERSAL_IDENTIFIER } from 'src/views/active-events.view';

export default defineNavigationMenuItem({
  universalIdentifier: 'a6168167-acf1-4969-8dc4-389a821a9c1b',
  name: 'Eventos',
  icon: 'IconLayoutKanban',
  color: 'blue',
  position: 0,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: ACTIVE_EVENTS_VIEW_UNIVERSAL_IDENTIFIER,
});
