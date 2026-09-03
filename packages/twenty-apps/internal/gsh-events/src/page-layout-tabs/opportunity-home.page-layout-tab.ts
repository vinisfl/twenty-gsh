import {
  definePageLayoutTab,
  PageLayoutTabLayoutMode,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  OPPORTUNITY_STATUS_NOW_WIDGET_UNIVERSAL_IDENTIFIER,
  STATUS_NOW_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

const OPPORTUNITY_HOME_TAB =
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.opportunityRecordPage.tabs.home;
const OPPORTUNITY_FIELDS =
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.fields;
const OPPORTUNITY_RECORD_PAGE_FIELDS_VIEW_ID =
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.views
    .opportunityRecordPageFields.universalIdentifier;

// Overrides the standard Opportunity "Home" tab to surface the "Status agora"
// widget (funnel stepper + current-situation chip) above every other field.
export default definePageLayoutTab({
  universalIdentifier: OPPORTUNITY_HOME_TAB.universalIdentifier,
  pageLayoutUniversalIdentifier:
    STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.opportunityRecordPage
      .universalIdentifier,
  title: 'Home',
  position: 10,
  icon: 'IconHome',
  layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
  widgets: [
    {
      universalIdentifier: OPPORTUNITY_STATUS_NOW_WIDGET_UNIVERSAL_IDENTIFIER,
      title: 'Status agora',
      type: 'FRONT_COMPONENT',
      configuration: {
        configurationType: 'FRONT_COMPONENT',
        frontComponentUniversalIdentifier:
          STATUS_NOW_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
      },
    },
    {
      universalIdentifier: OPPORTUNITY_HOME_TAB.widgets.fields.universalIdentifier,
      title: 'Fields',
      type: 'FIELDS',
      configuration: {
        configurationType: 'FIELDS',
        viewUniversalIdentifier: OPPORTUNITY_RECORD_PAGE_FIELDS_VIEW_ID,
      },
    },
    {
      universalIdentifier:
        OPPORTUNITY_HOME_TAB.widgets.pointOfContact.universalIdentifier,
      title: 'Point of Contact',
      type: 'FIELD',
      configuration: {
        configurationType: 'FIELD',
        fieldMetadataId: OPPORTUNITY_FIELDS.pointOfContact.universalIdentifier,
        fieldDisplayMode: 'CARD',
      },
    },
    {
      universalIdentifier: OPPORTUNITY_HOME_TAB.widgets.company.universalIdentifier,
      title: 'Company',
      type: 'FIELD',
      configuration: {
        configurationType: 'FIELD',
        fieldMetadataId: OPPORTUNITY_FIELDS.company.universalIdentifier,
        fieldDisplayMode: 'CARD',
      },
    },
    {
      universalIdentifier: OPPORTUNITY_HOME_TAB.widgets.owner.universalIdentifier,
      title: 'Owner',
      type: 'FIELD',
      configuration: {
        configurationType: 'FIELD',
        fieldMetadataId: OPPORTUNITY_FIELDS.owner.universalIdentifier,
        fieldDisplayMode: 'CARD',
      },
    },
  ],
});
