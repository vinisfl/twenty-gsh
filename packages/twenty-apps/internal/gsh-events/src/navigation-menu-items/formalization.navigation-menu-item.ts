import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';
import { FORMALIZATION_PENDING_VIEW_UNIVERSAL_IDENTIFIER } from 'src/views/formalization-pending.view';

export default defineNavigationMenuItem({
  universalIdentifier: '883350c9-9e13-4ad4-bcd3-d6e5734510c4',
  name: 'Formalização',
  icon: 'IconChecklist',
  position: 1,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: FORMALIZATION_PENDING_VIEW_UNIVERSAL_IDENTIFIER,
});
