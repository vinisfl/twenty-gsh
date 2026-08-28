import { defineRole, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';
import { EVENT_OBJECT_UNIVERSAL_IDENTIFIER, FINANCE_ROLE_UNIVERSAL_IDENTIFIER, PROPOSAL_OBJECT_UNIVERSAL_IDENTIFIER, SERVICE_ORDER_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

const readOnly = { canReadObjectRecords: true, canUpdateObjectRecords: false, canSoftDeleteObjectRecords: false, canDestroyObjectRecords: false };
const readWrite = { ...readOnly, canUpdateObjectRecords: true };

export default defineRole({
  universalIdentifier: FINANCE_ROLE_UNIVERSAL_IDENTIFIER,
  label: 'GSH Financeiro',
  description: 'Mantém cadastro fiscal e situação documental da venda.',
  icon: 'IconReceipt',
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
    { objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier, ...readOnly },
    { objectUniversalIdentifier: EVENT_OBJECT_UNIVERSAL_IDENTIFIER, ...readOnly },
    { objectUniversalIdentifier: PROPOSAL_OBJECT_UNIVERSAL_IDENTIFIER, ...readOnly },
    { objectUniversalIdentifier: SERVICE_ORDER_OBJECT_UNIVERSAL_IDENTIFIER, ...readOnly },
  ],
});
