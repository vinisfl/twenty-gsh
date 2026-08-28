import { definePageLayout, PageLayoutTabLayoutMode } from 'twenty-sdk/define';
import { PROPOSAL_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default definePageLayout({
  universalIdentifier: '9ef1320e-fd0f-4a77-8846-96793368c8ab',
  name: 'Proposta — registro',
  type: 'RECORD_PAGE',
  objectUniversalIdentifier: PROPOSAL_OBJECT_UNIVERSAL_IDENTIFIER,
  tabs: [
    {
      universalIdentifier: '3e393fff-8e13-48bd-b34c-98e2e39e3fa8',
      title: 'Proposta',
      position: 0,
      icon: 'IconFileInvoice',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [{ universalIdentifier: '5ca8e2a9-7a59-4c62-bbf1-cd1fa6a2cfa8', title: 'Dados da proposta', type: 'FIELDS', configuration: { configurationType: 'FIELDS' } }],
    },
    {
      universalIdentifier: '41ce40cf-2b48-45ff-9dbd-25d3c82141e3',
      title: 'Histórico',
      position: 10,
      icon: 'IconTimelineEvent',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [{ universalIdentifier: 'dffb23e0-b477-4216-a535-e4a3c45a7296', title: 'Histórico', type: 'TIMELINE', configuration: { configurationType: 'TIMELINE' } }],
    },
  ],
});
