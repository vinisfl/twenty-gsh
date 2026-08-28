import { defineRole, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';
import { EVENT_OBJECT_UNIVERSAL_IDENTIFIER, OPERATIONS_ROLE_UNIVERSAL_IDENTIFIER, PROPOSAL_OBJECT_UNIVERSAL_IDENTIFIER, SERVICE_ORDER_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

const readOnly = { canReadObjectRecords: true, canUpdateObjectRecords: false, canSoftDeleteObjectRecords: false, canDestroyObjectRecords: false };
const readWrite = { ...readOnly, canUpdateObjectRecords: true };

export default defineRole({
  universalIdentifier: OPERATIONS_ROLE_UNIVERSAL_IDENTIFIER,
  label: 'GSH Operações',
  description: 'Recebe o handoff e conduz OS, preparação e execução.',
  icon: 'IconTools',
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
    { objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier, ...readOnly },
    { objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier, ...readOnly },
    { objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.note.universalIdentifier, ...readWrite },
    { objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.task.universalIdentifier, ...readWrite },
    { objectUniversalIdentifier: EVENT_OBJECT_UNIVERSAL_IDENTIFIER, ...readWrite },
    { objectUniversalIdentifier: PROPOSAL_OBJECT_UNIVERSAL_IDENTIFIER, ...readOnly },
    { objectUniversalIdentifier: SERVICE_ORDER_OBJECT_UNIVERSAL_IDENTIFIER, ...readWrite },
  ],
});
