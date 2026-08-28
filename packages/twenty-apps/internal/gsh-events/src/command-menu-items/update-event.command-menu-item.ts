import { defineCommandMenuItem, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';
import { UPDATE_EVENT_COMMAND_UNIVERSAL_IDENTIFIER, UPDATE_EVENT_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineCommandMenuItem({
  universalIdentifier: UPDATE_EVENT_COMMAND_UNIVERSAL_IDENTIFIER,
  label: 'Atualizar evento',
  shortLabel: 'Atualizar',
  isPinned: true,
  availabilityType: 'RECORD_SELECTION',
  availabilityObjectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  frontComponentUniversalIdentifier: UPDATE_EVENT_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
});
