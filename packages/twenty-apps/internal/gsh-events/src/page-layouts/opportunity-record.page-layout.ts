import {
  definePageLayout,
  PageLayoutTabLayoutMode,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  OPPORTUNITY_CALENDAR_TAB_UNIVERSAL_IDENTIFIER,
  OPPORTUNITY_CALENDAR_WIDGET_UNIVERSAL_IDENTIFIER,
  OPPORTUNITY_COMPANY_WIDGET_UNIVERSAL_IDENTIFIER,
  OPPORTUNITY_EMAILS_TAB_UNIVERSAL_IDENTIFIER,
  OPPORTUNITY_EMAILS_WIDGET_UNIVERSAL_IDENTIFIER,
  OPPORTUNITY_FIELDS_WIDGET_UNIVERSAL_IDENTIFIER,
  OPPORTUNITY_FILES_TAB_UNIVERSAL_IDENTIFIER,
  OPPORTUNITY_FILES_WIDGET_UNIVERSAL_IDENTIFIER,
  OPPORTUNITY_HOME_TAB_UNIVERSAL_IDENTIFIER,
  OPPORTUNITY_NOTES_TAB_UNIVERSAL_IDENTIFIER,
  OPPORTUNITY_NOTES_WIDGET_UNIVERSAL_IDENTIFIER,
  OPPORTUNITY_OWNER_WIDGET_UNIVERSAL_IDENTIFIER,
  OPPORTUNITY_POINT_OF_CONTACT_WIDGET_UNIVERSAL_IDENTIFIER,
  OPPORTUNITY_RECORD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
  OPPORTUNITY_STATUS_NOW_WIDGET_UNIVERSAL_IDENTIFIER,
  OPPORTUNITY_TASKS_TAB_UNIVERSAL_IDENTIFIER,
  OPPORTUNITY_TASKS_WIDGET_UNIVERSAL_IDENTIFIER,
  OPPORTUNITY_TIMELINE_TAB_UNIVERSAL_IDENTIFIER,
  OPPORTUNITY_TIMELINE_WIDGET_UNIVERSAL_IDENTIFIER,
  STATUS_NOW_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

const OPPORTUNITY_FIELDS = STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.fields;
const OPPORTUNITY_RECORD_PAGE_FIELDS_VIEW_ID =
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.views
    .opportunityRecordPageFields.universalIdentifier;

// The standard Opportunity record page's "Home" tab is owned by the Twenty
// Standard application and can't be overridden in place (its tab/widget ids
// belong to that app, so redeclaring them collides on apply). This app
// therefore owns a full replacement Opportunity record page — mirroring the
// standard tabs so nothing regresses — with the "Status agora" widget
// prepended to Home, above Fields/Point of Contact/Company/Owner.
export default definePageLayout({
  universalIdentifier: OPPORTUNITY_RECORD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
  name: 'Opportunity — registro',
  type: 'RECORD_PAGE',
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  tabs: [
    {
      universalIdentifier: OPPORTUNITY_HOME_TAB_UNIVERSAL_IDENTIFIER,
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
            frontComponentUniversalIdentifier: STATUS_NOW_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
        {
          universalIdentifier: OPPORTUNITY_FIELDS_WIDGET_UNIVERSAL_IDENTIFIER,
          title: 'Fields',
          type: 'FIELDS',
          configuration: {
            configurationType: 'FIELDS',
            viewUniversalIdentifier: OPPORTUNITY_RECORD_PAGE_FIELDS_VIEW_ID,
          },
        },
        {
          universalIdentifier: OPPORTUNITY_POINT_OF_CONTACT_WIDGET_UNIVERSAL_IDENTIFIER,
          title: 'Point of Contact',
          type: 'FIELD',
          configuration: {
            configurationType: 'FIELD',
            fieldMetadataId: OPPORTUNITY_FIELDS.pointOfContact.universalIdentifier,
            fieldDisplayMode: 'CARD',
          },
        },
        {
          universalIdentifier: OPPORTUNITY_COMPANY_WIDGET_UNIVERSAL_IDENTIFIER,
          title: 'Company',
          type: 'FIELD',
          configuration: {
            configurationType: 'FIELD',
            fieldMetadataId: OPPORTUNITY_FIELDS.company.universalIdentifier,
            fieldDisplayMode: 'CARD',
          },
        },
        {
          universalIdentifier: OPPORTUNITY_OWNER_WIDGET_UNIVERSAL_IDENTIFIER,
          title: 'Owner',
          type: 'FIELD',
          configuration: {
            configurationType: 'FIELD',
            fieldMetadataId: OPPORTUNITY_FIELDS.owner.universalIdentifier,
            fieldDisplayMode: 'CARD',
          },
        },
      ],
    },
    {
      universalIdentifier: OPPORTUNITY_TIMELINE_TAB_UNIVERSAL_IDENTIFIER,
      title: 'Timeline',
      position: 20,
      icon: 'IconTimelineEvent',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: OPPORTUNITY_TIMELINE_WIDGET_UNIVERSAL_IDENTIFIER,
          title: 'Timeline',
          type: 'TIMELINE',
          configuration: { configurationType: 'TIMELINE' },
        },
      ],
    },
    {
      universalIdentifier: OPPORTUNITY_TASKS_TAB_UNIVERSAL_IDENTIFIER,
      title: 'Tasks',
      position: 30,
      icon: 'IconCheckbox',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: OPPORTUNITY_TASKS_WIDGET_UNIVERSAL_IDENTIFIER,
          title: 'Tasks',
          type: 'TASKS',
          configuration: { configurationType: 'TASKS' },
        },
      ],
    },
    {
      universalIdentifier: OPPORTUNITY_NOTES_TAB_UNIVERSAL_IDENTIFIER,
      title: 'Notes',
      position: 40,
      icon: 'IconNotes',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: OPPORTUNITY_NOTES_WIDGET_UNIVERSAL_IDENTIFIER,
          title: 'Notes',
          type: 'NOTES',
          configuration: { configurationType: 'NOTES' },
        },
      ],
    },
    {
      universalIdentifier: OPPORTUNITY_FILES_TAB_UNIVERSAL_IDENTIFIER,
      title: 'Files',
      position: 50,
      icon: 'IconPaperclip',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: OPPORTUNITY_FILES_WIDGET_UNIVERSAL_IDENTIFIER,
          title: 'Files',
          type: 'FILES',
          configuration: { configurationType: 'FILES' },
        },
      ],
    },
    {
      universalIdentifier: OPPORTUNITY_EMAILS_TAB_UNIVERSAL_IDENTIFIER,
      title: 'Emails',
      position: 60,
      icon: 'IconMail',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: OPPORTUNITY_EMAILS_WIDGET_UNIVERSAL_IDENTIFIER,
          title: 'Emails',
          type: 'EMAILS',
          configuration: { configurationType: 'EMAILS' },
        },
      ],
    },
    {
      universalIdentifier: OPPORTUNITY_CALENDAR_TAB_UNIVERSAL_IDENTIFIER,
      title: 'Calendar',
      position: 70,
      icon: 'IconCalendarEvent',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: OPPORTUNITY_CALENDAR_WIDGET_UNIVERSAL_IDENTIFIER,
          title: 'Calendar',
          type: 'CALENDAR',
          configuration: { configurationType: 'CALENDAR' },
        },
      ],
    },
  ],
});
