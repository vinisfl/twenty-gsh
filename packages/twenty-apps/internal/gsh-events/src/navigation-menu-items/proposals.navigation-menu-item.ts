import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';
import { PROPOSALS_VIEW_UNIVERSAL_IDENTIFIER } from 'src/views/proposals.view';

export default defineNavigationMenuItem({
  universalIdentifier: '45b7beca-d90e-4886-8dc0-a669f3b9f5b4',
  name: 'Propostas',
  icon: 'IconFileInvoice',
  position: 3,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: PROPOSALS_VIEW_UNIVERSAL_IDENTIFIER,
});
