import { definePageLayoutTab, PageLayoutTabLayoutMode, STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';
import { OPPORTUNITY_EVENT_TAB_UNIVERSAL_IDENTIFIER, OPPORTUNITY_EVENT_WIDGET_UNIVERSAL_IDENTIFIER, UPDATE_EVENT_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default definePageLayoutTab({
  universalIdentifier: OPPORTUNITY_EVENT_TAB_UNIVERSAL_IDENTIFIER,
  pageLayoutUniversalIdentifier: STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.opportunityRecordPage.universalIdentifier,
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
