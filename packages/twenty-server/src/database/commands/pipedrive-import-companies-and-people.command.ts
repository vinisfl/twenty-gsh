import { readFileSync } from 'fs';

import { type CountryCode } from 'libphonenumber-js';
import { Command, Option } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import {
  type RunOnWorkspaceArgs,
  type WorkspaceCommandOptions,
} from 'src/database/commands/command-runners/workspace.command-runner';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';
import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

const COMPANY_BATCH_SIZE = 200;
const PERSON_BATCH_SIZE = 200;

// Pipedrive custom field keys are stable per-field across all organization
// records in this account (confirmed by sampling the full export).
const CNPJ_CPF_CUSTOM_FIELD_KEY = '0052f6b7bb61a420be166ba2b42d1494030dccff';
const LEGAL_NAME_CUSTOM_FIELD_KEY = '52fc63b234f09690ca1a8a208c772c809307c258';

type PipedriveOrganizationRecord = {
  id: number;
  name: string | null;
  is_deleted?: boolean;
  custom_fields?: Record<string, string | null> | null;
};

type PipedrivePersonEmailOrPhone = {
  label?: string;
  value: string;
  primary?: boolean;
};

type PipedrivePersonRecord = {
  id: number;
  first_name: string | null;
  last_name: string | null;
  org_id: number | null | { value: number };
  emails?: PipedrivePersonEmailOrPhone[];
  phones?: PipedrivePersonEmailOrPhone[];
  is_deleted?: boolean;
};

type CompanyWithPipedriveField = CompanyWorkspaceEntity & {
  pipedriveOrgId: string | null;
  taxId: string | null;
  legalName: string | null;
};

type PersonWithPipedriveField = PersonWorkspaceEntity & {
  pipedrivePersonId: string | null;
};

type ImportPipedriveDataOptions = WorkspaceCommandOptions & {
  companiesFile: string;
  personsFile: string;
  limit?: number;
};

@Command({
  name: 'pipedrive:import-companies-and-people',
  description:
    'Backfill Companies and People from exported Pipedrive organizations/persons JSON files. Upserts by pipedriveOrgId/pipedrivePersonId. Requires pipedrive:ensure-fields to have been run first.',
})
export class PipedriveImportCompaniesAndPeopleCommand extends ProvisionedWorkspaceCommandRunner<ImportPipedriveDataOptions> {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly objectMetadataService: ObjectMetadataService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
  ) {
    super(workspaceIteratorService);
  }

  @Option({
    flags: '--companies-file <path>',
    description: 'Path to the exported Pipedrive organizations JSON array',
    required: true,
  })
  parseCompaniesFile(val: string): string {
    return val;
  }

  @Option({
    flags: '--persons-file <path>',
    description: 'Path to the exported Pipedrive persons JSON array',
    required: true,
  })
  parsePersonsFile(val: string): string {
    return val;
  }

  @Option({
    flags: '--limit <count>',
    description:
      'Only process the first N companies and N persons (for a test run)',
    required: false,
  })
  parseLimit(val: string): number {
    const parsed = parseInt(val, 10);

    if (isNaN(parsed) || parsed <= 0) {
      throw new Error('--limit must be a positive number');
    }

    return parsed;
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const importOptions = options as ImportPipedriveDataOptions;
    const isDryRun = importOptions.dryRun ?? false;

    await this.assertFieldExists(workspaceId, 'company', 'pipedriveOrgId');
    await this.assertFieldExists(workspaceId, 'person', 'pipedrivePersonId');

    const organizations: PipedriveOrganizationRecord[] = JSON.parse(
      readFileSync(importOptions.companiesFile, 'utf-8'),
    );
    const persons: PipedrivePersonRecord[] = JSON.parse(
      readFileSync(importOptions.personsFile, 'utf-8'),
    );

    const limitedOrgs = importOptions.limit
      ? organizations.slice(0, importOptions.limit)
      : organizations;
    const limitedPersons = importOptions.limit
      ? persons.slice(0, importOptions.limit)
      : persons;

    const companyRepository =
      this.workspaceOrmManager.getRepository<CompanyWithPipedriveField>(
        'company',
        { shouldBypassPermissionChecks: true },
      );
    const personRepository =
      this.workspaceOrmManager.getRepository<PersonWithPipedriveField>(
        'person',
        { shouldBypassPermissionChecks: true },
      );

    const orgIdToCompanyId = new Map<string, string>();
    let companiesCreated = 0;
    let companiesUpdated = 0;
    let companiesSkipped = 0;

    for (let i = 0; i < limitedOrgs.length; i += COMPANY_BATCH_SIZE) {
      const batch = limitedOrgs.slice(i, i + COMPANY_BATCH_SIZE);

      for (const org of batch) {
        if (org.is_deleted) {
          companiesSkipped++;
          continue;
        }

        const name = org.name?.trim();

        if (!name) {
          companiesSkipped++;
          continue;
        }

        const pipedriveOrgId = String(org.id);
        const taxId = org.custom_fields?.[CNPJ_CPF_CUSTOM_FIELD_KEY]?.trim() || null;
        const legalName =
          org.custom_fields?.[LEGAL_NAME_CUSTOM_FIELD_KEY]?.trim() || null;
        const existing = await companyRepository.findOne({
          where: { pipedriveOrgId },
        });

        if (isDryRun) {
          if (existing) {
            companiesUpdated++;
            orgIdToCompanyId.set(pipedriveOrgId, existing.id);
          } else {
            companiesCreated++;
          }
          continue;
        }

        if (existing) {
          await companyRepository.update(existing.id, {
            name,
            taxId,
            legalName,
          });
          orgIdToCompanyId.set(pipedriveOrgId, existing.id);
          companiesUpdated++;
        } else {
          const [created] = await companyRepository.save({
            name,
            pipedriveOrgId,
            taxId,
            legalName,
          });

          orgIdToCompanyId.set(pipedriveOrgId, created.id);
          companiesCreated++;
        }
      }

      this.logger.log(
        `Companies progress: ${Math.min(i + COMPANY_BATCH_SIZE, limitedOrgs.length)}/${limitedOrgs.length}`,
      );
    }

    this.logger.log(
      `Companies done: ${companiesCreated} created, ${companiesUpdated} updated, ${companiesSkipped} skipped`,
    );

    let personsCreated = 0;
    let personsUpdated = 0;
    let personsSkipped = 0;
    let personsLinked = 0;
    let personsEmailDropped = 0;
    let personsFailed = 0;

    for (let i = 0; i < limitedPersons.length; i += PERSON_BATCH_SIZE) {
      const batch = limitedPersons.slice(i, i + PERSON_BATCH_SIZE);

      for (const person of batch) {
        if (person.is_deleted) {
          personsSkipped++;
          continue;
        }

        const firstName = person.first_name?.trim() ?? '';
        const lastName = person.last_name?.trim() ?? '';

        if (!firstName && !lastName) {
          personsSkipped++;
          continue;
        }

        const pipedrivePersonId = String(person.id);
        const rawOrgId =
          typeof person.org_id === 'object' && person.org_id !== null
            ? person.org_id.value
            : person.org_id;
        const companyId = isDefined(rawOrgId)
          ? orgIdToCompanyId.get(String(rawOrgId))
          : undefined;

        if (isDefined(companyId)) {
          personsLinked++;
        }

        const primaryEmail =
          person.emails?.find((email) => email.primary)?.value?.trim() ||
          person.emails?.[0]?.value?.trim() ||
          null;
        const primaryPhone =
          person.phones?.find((phone) => phone.primary)?.value ??
          person.phones?.[0]?.value ??
          '';

        // person.emails.primaryEmail has a workspace-wide unique constraint;
        // Pipedrive allows duplicate/blank emails across contacts, so a
        // collision here must not abort the whole import (see retry below).
        const buildData = (email: string | null): Record<string, unknown> => ({
          name: { firstName, lastName },
          emails: { primaryEmail: email, additionalEmails: null },
          phones: {
            primaryPhoneNumber: primaryPhone,
            primaryPhoneCountryCode: '' as CountryCode,
            primaryPhoneCallingCode: '',
            additionalPhones: null,
          },
          companyId: companyId ?? null,
        });

        const existing = await personRepository.findOne({
          where: { pipedrivePersonId },
        });

        if (isDryRun) {
          if (existing) {
            personsUpdated++;
          } else {
            personsCreated++;
          }
          continue;
        }

        try {
          if (existing) {
            await personRepository.update(existing.id, buildData(primaryEmail));
          } else {
            await personRepository.save({
              ...buildData(primaryEmail),
              pipedrivePersonId,
            });
          }
          if (existing) {
            personsUpdated++;
          } else {
            personsCreated++;
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);

          if (!/duplicate/i.test(message) || !isDefined(primaryEmail)) {
            this.logger.warn(
              `Failed to save person ${pipedrivePersonId}: ${message}`,
            );
            personsFailed++;
            continue;
          }

          try {
            if (existing) {
              await personRepository.update(existing.id, buildData(null));
              personsUpdated++;
            } else {
              await personRepository.save({
                ...buildData(null),
                pipedrivePersonId,
              });
              personsCreated++;
            }
            personsEmailDropped++;
          } catch (retryError) {
            const retryMessage =
              retryError instanceof Error
                ? retryError.message
                : String(retryError);

            this.logger.warn(
              `Failed to save person ${pipedrivePersonId} even after dropping email: ${retryMessage}`,
            );
            personsFailed++;
          }
        }
      }

      this.logger.log(
        `Persons progress: ${Math.min(i + PERSON_BATCH_SIZE, limitedPersons.length)}/${limitedPersons.length}`,
      );
    }

    this.logger.log(
      `Persons done: ${personsCreated} created, ${personsUpdated} updated, ${personsSkipped} skipped, ${personsLinked} linked to a company, ${personsEmailDropped} had a conflicting email dropped, ${personsFailed} failed`,
    );
  }

  private async assertFieldExists(
    workspaceId: string,
    objectNameSingular: string,
    fieldName: string,
  ): Promise<void> {
    const objectMetadata =
      await this.objectMetadataService.findOneWithinWorkspace(workspaceId, {
        where: { nameSingular: objectNameSingular },
      });

    const exists = objectMetadata?.fields.some(
      (field) => field.name === fieldName,
    );

    if (!exists) {
      throw new Error(
        `Field ${objectNameSingular}.${fieldName} not found in workspace ${workspaceId}. Run "npx nx run twenty-server:command pipedrive:ensure-fields -w ${workspaceId}" first.`,
      );
    }
  }
}
