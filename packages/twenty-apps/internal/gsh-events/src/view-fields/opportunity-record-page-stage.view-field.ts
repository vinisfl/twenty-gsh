import { defineViewField, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

const opportunityRecordPageFields =
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.views.opportunityRecordPageFields;

// Native "Stage" is superseded by the GSH "Etapa do evento" field (opportunity-process-stage.field.ts),
// which is what actually drives the Kanban. Hidden (not deactivated) so historical data stays intact.
export default defineViewField({
  universalIdentifier: opportunityRecordPageFields.viewFields.stage.universalIdentifier,
  viewUniversalIdentifier: opportunityRecordPageFields.universalIdentifier,
  fieldMetadataUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.fields.stage.universalIdentifier,
  viewFieldGroupUniversalIdentifier: opportunityRecordPageFields.viewFieldGroups.deal.universalIdentifier,
  position: 1,
  size: 150,
  isVisible: false,
});
