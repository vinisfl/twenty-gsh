import { Logger } from '@nestjs/common';

import { Command, CommandRunner, Option } from 'nest-commander';
import { FieldMetadataType } from 'twenty-shared/types';

import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/services/field-metadata.service';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';

type EnsurePipedriveFieldsOptions = {
  workspaceId: string;
  dryRun?: boolean;
};

const FIELDS_TO_ENSURE = [
  {
    objectNameSingular: 'company',
    name: 'pipedriveOrgId',
    label: 'Pipedrive Org ID',
    icon: 'IconId',
  },
  {
    objectNameSingular: 'person',
    name: 'pipedrivePersonId',
    label: 'Pipedrive Person ID',
    icon: 'IconId',
  },
] as const;

@Command({
  name: 'pipedrive:ensure-fields',
  description:
    'Create the pipedriveOrgId (Company) and pipedrivePersonId (Person) custom text fields used to idempotently sync data from Pipedrive. Safe to re-run.',
})
export class PipedriveEnsureFieldsCommand extends CommandRunner {
  private readonly logger = new Logger(PipedriveEnsureFieldsCommand.name);

  constructor(
    private readonly objectMetadataService: ObjectMetadataService,
    private readonly fieldMetadataService: FieldMetadataService,
  ) {
    super();
  }

  @Option({
    flags: '-w, --workspace-id <workspace_id>',
    description: 'Workspace id to create the fields in',
    required: true,
  })
  parseWorkspaceId(val: string): string {
    return val;
  }

  @Option({
    flags: '-d, --dry-run',
    description: 'Simulate without making changes',
    required: false,
  })
  parseDryRun(): boolean {
    return true;
  }

  async run(
    _passedParams: string[],
    options: EnsurePipedriveFieldsOptions,
  ): Promise<void> {
    for (const fieldSpec of FIELDS_TO_ENSURE) {
      const objectMetadata =
        await this.objectMetadataService.findOneWithinWorkspace(
          options.workspaceId,
          { where: { nameSingular: fieldSpec.objectNameSingular } },
        );

      if (!objectMetadata) {
        throw new Error(
          `Object "${fieldSpec.objectNameSingular}" not found in workspace ${options.workspaceId}`,
        );
      }

      const alreadyExists = objectMetadata.fields.some(
        (field) => field.name === fieldSpec.name,
      );

      if (alreadyExists) {
        this.logger.log(
          `${fieldSpec.objectNameSingular}.${fieldSpec.name} already exists, skipping`,
        );
        continue;
      }

      if (options.dryRun) {
        this.logger.log(
          `[DRY RUN] Would create ${fieldSpec.objectNameSingular}.${fieldSpec.name}`,
        );
        continue;
      }

      await this.fieldMetadataService.createOneField({
        workspaceId: options.workspaceId,
        createFieldInput: {
          objectMetadataId: objectMetadata.id,
          type: FieldMetadataType.TEXT,
          name: fieldSpec.name,
          label: fieldSpec.label,
          icon: fieldSpec.icon,
          isNullable: true,
        },
      });

      this.logger.log(
        `Created ${fieldSpec.objectNameSingular}.${fieldSpec.name}`,
      );
    }
  }
}
