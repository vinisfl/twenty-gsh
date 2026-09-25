import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';
import { CLOSED_EVENTS_VIEW_UNIVERSAL_IDENTIFIER } from 'src/views/closed-events.view';

export default defineNavigationMenuItem({
  universalIdentifier: '08bdc3bc-349e-4918-a666-3dcf9366ce4c',
  name: 'Encerrados',
  icon: 'IconArchive',
  position: 6,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: CLOSED_EVENTS_VIEW_UNIVERSAL_IDENTIFIER,
});
