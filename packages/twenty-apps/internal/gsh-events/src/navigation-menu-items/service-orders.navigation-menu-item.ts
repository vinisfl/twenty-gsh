import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';
import { SERVICE_ORDERS_VIEW_UNIVERSAL_IDENTIFIER } from 'src/views/service-orders.view';

export default defineNavigationMenuItem({
  universalIdentifier: 'ea616ece-a86f-4edb-83fa-f312821bdeca',
  name: 'OS da semana',
  icon: 'IconClipboardCheck',
  position: 4,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: SERVICE_ORDERS_VIEW_UNIVERSAL_IDENTIFIER,
});
