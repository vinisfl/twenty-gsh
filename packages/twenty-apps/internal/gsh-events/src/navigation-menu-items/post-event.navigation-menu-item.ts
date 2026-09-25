import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';
import { POST_EVENT_VIEW_UNIVERSAL_IDENTIFIER } from 'src/views/post-event.view';

export default defineNavigationMenuItem({
  universalIdentifier: '3fefe1f7-927d-427f-aa33-28d7b8e58618',
  name: 'Pós-evento',
  icon: 'IconMessageCircle',
  position: 5,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: POST_EVENT_VIEW_UNIVERSAL_IDENTIFIER,
});
