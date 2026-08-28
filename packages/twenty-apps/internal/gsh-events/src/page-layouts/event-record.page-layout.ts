import { definePageLayout, PageLayoutTabLayoutMode } from 'twenty-sdk/define';
import { EVENT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default definePageLayout({
  universalIdentifier: '75421477-d4ab-4dcd-a7a7-796632c8bb79',
  name: 'Evento — registro',
  type: 'RECORD_PAGE',
  objectUniversalIdentifier: EVENT_OBJECT_UNIVERSAL_IDENTIFIER,
  tabs: [
    {
      universalIdentifier: '856f2373-3ffb-4dc8-b520-6fff26f702a9',
      title: 'Evento',
      position: 0,
      icon: 'IconCalendarEvent',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [{ universalIdentifier: '478e3542-918f-4f61-a19a-feffe71483cb', title: 'Dados do evento', type: 'FIELDS', configuration: { configurationType: 'FIELDS' } }],
    },
    {
      universalIdentifier: 'd5fd6953-c3cb-42ff-af3a-f072a0376b28',
      title: 'Histórico',
      position: 10,
      icon: 'IconTimelineEvent',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [{ universalIdentifier: '365d187e-16e9-4bec-99d7-943322aed7e7', title: 'Histórico', type: 'TIMELINE', configuration: { configurationType: 'TIMELINE' } }],
    },
  ],
});
