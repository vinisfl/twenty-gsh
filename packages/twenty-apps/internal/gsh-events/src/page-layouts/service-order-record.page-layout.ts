import { definePageLayout, PageLayoutTabLayoutMode } from 'twenty-sdk/define';
import { SERVICE_ORDER_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default definePageLayout({
  universalIdentifier: '2c637916-4fc3-434b-9c01-33e1b3391c5e',
  name: 'Ordem de serviço — registro',
  type: 'RECORD_PAGE',
  objectUniversalIdentifier: SERVICE_ORDER_OBJECT_UNIVERSAL_IDENTIFIER,
  tabs: [
    {
      universalIdentifier: 'e4f50bb6-e3ee-441a-a9c4-6af9dd8f2448',
      title: 'Ordem de serviço',
      position: 0,
      icon: 'IconClipboardCheck',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [{ universalIdentifier: '473d1a45-2a9c-4b37-8700-95b090752e01', title: 'Dados operacionais', type: 'FIELDS', configuration: { configurationType: 'FIELDS', viewUniversalIdentifier: null } }],
    },
    {
      universalIdentifier: '7a6868bf-68b4-4080-b871-ff4b5a142ae8',
      title: 'Histórico',
      position: 10,
      icon: 'IconTimelineEvent',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [{ universalIdentifier: '6e0e48c1-0abf-4028-a943-0116d09294ce', title: 'Histórico', type: 'TIMELINE', configuration: { configurationType: 'TIMELINE' } }],
    },
  ],
});
