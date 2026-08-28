import { defineField, FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';
import { CONTRACT_STATUS } from 'src/constants/domain-options';
import { OPPORTUNITY_CONTRACT_STATUS_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: OPPORTUNITY_CONTRACT_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: FieldType.SELECT,
  name: 'contractStatus',
  label: 'Contrato',
  icon: 'IconFileCertificate',
  defaultValue: `'${CONTRACT_STATUS.NOT_STARTED}'`,
  options: [
    { id: 'de56ceb4-9cb5-44ef-84d7-1ac5c9a3db92', value: CONTRACT_STATUS.NOT_STARTED, label: 'Não iniciado', position: 0, color: 'gray' },
    { id: 'd90b3789-669b-4c7b-b8a4-91913b0c0c2a', value: CONTRACT_STATUS.SENT, label: 'Enviado', position: 1, color: 'yellow' },
    { id: '6c8a0b38-aef6-44d0-af90-d4c63742be5d', value: CONTRACT_STATUS.SIGNED, label: 'Assinado', position: 2, color: 'green' },
  ],
});
