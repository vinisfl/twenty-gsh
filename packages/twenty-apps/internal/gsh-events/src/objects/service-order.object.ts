import { defineObject, FieldType } from 'twenty-sdk/define';

import { SERVICE_ORDER_STATUS } from 'src/constants/domain-options';
import {
  SERVICE_ORDER_DISTRIBUTED_AT_FIELD_UNIVERSAL_IDENTIFIER,
  SERVICE_ORDER_DISTRIBUTION_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  SERVICE_ORDER_DOCUMENT_FIELD_UNIVERSAL_IDENTIFIER,
  SERVICE_ORDER_EVENT_AT_FIELD_UNIVERSAL_IDENTIFIER,
  SERVICE_ORDER_MENU_FIELD_UNIVERSAL_IDENTIFIER,
  SERVICE_ORDER_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  SERVICE_ORDER_OBJECT_UNIVERSAL_IDENTIFIER,
  SERVICE_ORDER_RESPONSIBLE_FIELD_UNIVERSAL_IDENTIFIER,
  SERVICE_ORDER_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  SERVICE_ORDER_STRUCTURE_FIELD_UNIVERSAL_IDENTIFIER,
  SERVICE_ORDER_TEAM_FIELD_UNIVERSAL_IDENTIFIER,
  SERVICE_ORDER_TIMELINE_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineObject({
  universalIdentifier: SERVICE_ORDER_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'eventServiceOrder',
  namePlural: 'eventServiceOrders',
  labelSingular: 'Ordem de serviço',
  labelPlural: 'Ordens de serviço',
  description: 'Documento operacional que coloca o evento em produção.',
  icon: 'IconClipboardCheck',
  labelIdentifierFieldMetadataUniversalIdentifier:
    SERVICE_ORDER_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    { universalIdentifier: SERVICE_ORDER_NAME_FIELD_UNIVERSAL_IDENTIFIER, type: FieldType.TEXT, name: 'name', label: 'Título', icon: 'IconClipboardCheck' },
    {
      universalIdentifier: SERVICE_ORDER_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      name: 'status',
      label: 'Status',
      icon: 'IconProgress',
      defaultValue: `'${SERVICE_ORDER_STATUS.PREPARING}'`,
      options: [
        { id: 'd18a1351-3536-4b20-82a0-350752410a15', value: SERVICE_ORDER_STATUS.PREPARING, label: 'Em preparação', position: 0, color: 'gray' },
        { id: 'c8bbf650-6cf9-438c-a5d9-c571bdb575e6', value: SERVICE_ORDER_STATUS.ISSUED, label: 'Emitida', position: 1, color: 'blue' },
        { id: '0d1d7978-f50a-4dd7-b6f8-7b8e72725e8a', value: SERVICE_ORDER_STATUS.DISTRIBUTED, label: 'Distribuída', position: 2, color: 'orange' },
        { id: '384e2d2c-2af9-4332-9461-d4e31123e5d2', value: SERVICE_ORDER_STATUS.COMPLETED, label: 'Concluída', position: 3, color: 'green' },
      ],
    },
    { universalIdentifier: SERVICE_ORDER_TIMELINE_FIELD_UNIVERSAL_IDENTIFIER, type: FieldType.RICH_TEXT, name: 'timeline', label: 'Cronograma', icon: 'IconTimelineEvent', isNullable: true },
    { universalIdentifier: SERVICE_ORDER_MENU_FIELD_UNIVERSAL_IDENTIFIER, type: FieldType.RICH_TEXT, name: 'finalMenu', label: 'Cardápio final', icon: 'IconToolsKitchen2', isNullable: true },
    { universalIdentifier: SERVICE_ORDER_STRUCTURE_FIELD_UNIVERSAL_IDENTIFIER, type: FieldType.RICH_TEXT, name: 'structureAndEquipment', label: 'Estrutura e equipamentos', icon: 'IconTools', isNullable: true },
    { universalIdentifier: SERVICE_ORDER_TEAM_FIELD_UNIVERSAL_IDENTIFIER, type: FieldType.RICH_TEXT, name: 'teamGuidance', label: 'Orientações à equipe', icon: 'IconUsers', isNullable: true },
    { universalIdentifier: SERVICE_ORDER_RESPONSIBLE_FIELD_UNIVERSAL_IDENTIFIER, type: FieldType.TEXT, name: 'responsible', label: 'Responsável operacional', icon: 'IconUserCheck', isNullable: true },
    { universalIdentifier: SERVICE_ORDER_EVENT_AT_FIELD_UNIVERSAL_IDENTIFIER, type: FieldType.DATE_TIME, name: 'eventAt', label: 'Data do evento', icon: 'IconCalendarEvent', isNullable: true },
    {
      universalIdentifier: SERVICE_ORDER_DISTRIBUTION_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      name: 'distributionStatus',
      label: 'Distribuição concluída',
      icon: 'IconSend',
      isNullable: true,
      options: [
        { id: '5a7f1da9-abe5-4d13-a1f6-974fa5c6edce', value: 'NO', label: 'Não', position: 0, color: 'gray' },
        { id: '63785638-5d7a-4a92-87ee-3ae937e4249e', value: 'PARTIAL', label: 'Parcial', position: 1, color: 'yellow' },
        { id: 'ec996d18-2da3-431c-a377-95db690f66eb', value: 'YES', label: 'Sim', position: 2, color: 'green' },
      ],
    },
    { universalIdentifier: SERVICE_ORDER_DISTRIBUTED_AT_FIELD_UNIVERSAL_IDENTIFIER, type: FieldType.DATE_TIME, name: 'distributedAt', label: 'Distribuída em', icon: 'IconSend', isNullable: true },
    { universalIdentifier: SERVICE_ORDER_DOCUMENT_FIELD_UNIVERSAL_IDENTIFIER, type: FieldType.TEXT, name: 'documentUrl', label: 'Link do documento', icon: 'IconLink', isNullable: true },
  ],
});
