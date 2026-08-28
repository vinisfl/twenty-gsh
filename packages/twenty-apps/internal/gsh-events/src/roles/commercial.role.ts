import { defineRole, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';
import { COMMERCIAL_ROLE_UNIVERSAL_IDENTIFIER, EVENT_OBJECT_UNIVERSAL_IDENTIFIER, PROPOSAL_OBJECT_UNIVERSAL_IDENTIFIER, SERVICE_ORDER_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

const readWrite = { canReadObjectRecords: true, canUpdateObjectRecords: true, canSoftDeleteObjectRecords: false, canDestroyObjectRecords: false };

export default defineRole({
  universalIdentifier: COMMERCIAL_ROLE_UNIVERSAL_IDENTIFIER,
  label: 'GSH Comercial',
  description: 'Opera o funil e mantém os dados comerciais do evento.',
  icon: 'IconBriefcase',
  canReadAllObjectRecords: false,
  canUpdateAllObjectRecords: false,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
  canUpdateAllSettings: false,
  canBeAssignedToUsers: true,
  canBeAssignedToAgents: false,
  canBeAssignedToApiKeys: false,
  objectPermissions: [
    { objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier, ...readWrite },
    { objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier, ...readWrite },
    { objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier, ...readWrite },
    { objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.note.universalIdentifier, ...readWrite },
    { objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.task.universalIdentifier, ...readWrite },
    { objectUniversalIdentifier: EVENT_OBJECT_UNIVERSAL_IDENTIFIER, ...readWrite },
    { objectUniversalIdentifier: PROPOSAL_OBJECT_UNIVERSAL_IDENTIFIER, ...readWrite },
    { objectUniversalIdentifier: SERVICE_ORDER_OBJECT_UNIVERSAL_IDENTIFIER, ...readWrite },
  ],
});
