import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';
import { EVENT_CALENDAR_VIEW_UNIVERSAL_IDENTIFIER } from 'src/views/event-calendar.view';

export default defineNavigationMenuItem({
  universalIdentifier: '10fb456c-656d-4010-bd7d-2ad338dc0968',
  name: 'Agenda',
  icon: 'IconCalendarEvent',
  position: 2,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: EVENT_CALENDAR_VIEW_UNIVERSAL_IDENTIFIER,
});
