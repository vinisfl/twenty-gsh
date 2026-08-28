import { defineField, FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';
import { PERSON_EVENT_ROLE_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: PERSON_EVENT_ROLE_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.SELECT,
  name: 'eventContactRole',
  label: 'Papel no evento',
  icon: 'IconUser',
  isNullable: true,
  options: [
    { id: 'b0535136-fba9-4be8-9f5e-6de82191900f', value: 'DECISION_MAKER', label: 'Decisor', position: 0, color: 'purple' },
    { id: 'f1fb4c6d-97a1-49c6-aab4-72b6b0f36ea1', value: 'REQUESTER', label: 'Solicitante', position: 1, color: 'blue' },
    { id: '7123aa27-9704-4af8-90ba-83609495d9c2', value: 'FINANCE', label: 'Financeiro', position: 2, color: 'green' },
    { id: 'd137ab78-39b8-4064-83a4-53cae0c751ed', value: 'OPERATIONS', label: 'Operação', position: 3, color: 'orange' },
    { id: '78fe31aa-9fb5-4cb2-82db-c5ca4091a18e', value: 'OTHER', label: 'Outro', position: 4, color: 'gray' },
  ],
});
