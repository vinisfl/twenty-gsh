import { definePageLayoutTab, PageLayoutTabLayoutMode } from 'twenty-sdk/define';
import { OPPORTUNITY_EVENT_TAB_UNIVERSAL_IDENTIFIER, OPPORTUNITY_EVENT_WIDGET_UNIVERSAL_IDENTIFIER, OPPORTUNITY_RECORD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER, UPDATE_EVENT_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

// Attached to this app's own Opportunity record page (see
// opportunity-record.page-layout.ts) rather than the standard one, since
// that page now owns the object's record page in this workspace.
export default definePageLayoutTab({
  universalIdentifier: OPPORTUNITY_EVENT_TAB_UNIVERSAL_IDENTIFIER,
  pageLayoutUniversalIdentifier: OPPORTUNITY_RECORD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
  title: 'Evento GSH',
  position: 15,
  icon: 'IconCalendarEvent',
  layoutMode: PageLayoutTabLayoutMode.CANVAS,
  widgets: [
    {
      universalIdentifier: OPPORTUNITY_EVENT_WIDGET_UNIVERSAL_IDENTIFIER,
      title: 'Atualizar evento',
      type: 'FRONT_COMPONENT',
      configuration: {
        configurationType: 'FRONT_COMPONENT',
        frontComponentUniversalIdentifier: UPDATE_EVENT_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
      },
    },
  ],
});
