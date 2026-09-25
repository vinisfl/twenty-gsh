import { defineView, ViewCalendarLayout, ViewType } from 'twenty-sdk/define';
import { EVENT_CONFIRMED_AUDIENCE_FIELD_UNIVERSAL_IDENTIFIER, EVENT_LOCATION_FIELD_UNIVERSAL_IDENTIFIER, EVENT_MODALITY_FIELD_UNIVERSAL_IDENTIFIER, EVENT_NAME_FIELD_UNIVERSAL_IDENTIFIER, EVENT_OBJECT_UNIVERSAL_IDENTIFIER, EVENT_START_AT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export const EVENT_CALENDAR_VIEW_UNIVERSAL_IDENTIFIER =
  '1afd9d6f-a098-4adc-9f2b-34846f8817fa';

export default defineView({
  universalIdentifier: EVENT_CALENDAR_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Agenda de eventos',
  objectUniversalIdentifier: EVENT_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.CALENDAR,
  icon: 'IconCalendarEvent',
  position: 0,
  calendarLayout: ViewCalendarLayout.MONTH,
  calendarFieldMetadataUniversalIdentifier: EVENT_START_AT_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    { universalIdentifier: '3e6b1e33-8166-4aea-b194-c9cff8dd2dd0', fieldMetadataUniversalIdentifier: EVENT_NAME_FIELD_UNIVERSAL_IDENTIFIER, position: 0, isVisible: true, size: 220 },
    { universalIdentifier: '6e884131-f8ab-4f89-9793-4336181993fd', fieldMetadataUniversalIdentifier: EVENT_LOCATION_FIELD_UNIVERSAL_IDENTIFIER, position: 1, isVisible: true, size: 180 },
    { universalIdentifier: '2661c752-b0bb-410b-ba0c-8a22539c94e9', fieldMetadataUniversalIdentifier: EVENT_MODALITY_FIELD_UNIVERSAL_IDENTIFIER, position: 2, isVisible: true, size: 150 },
    { universalIdentifier: '59ff4e8c-c0b6-41eb-80fe-7dfe2c1a0859', fieldMetadataUniversalIdentifier: EVENT_CONFIRMED_AUDIENCE_FIELD_UNIVERSAL_IDENTIFIER, position: 3, isVisible: true, size: 140 },
  ],
});
