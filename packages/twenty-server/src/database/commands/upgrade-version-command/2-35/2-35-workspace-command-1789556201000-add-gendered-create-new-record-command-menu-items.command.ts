import { Command } from 'nest-commander';

import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const NEW_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIERS = [
  STANDARD_COMMAND_MENU_ITEMS.createNewPersonRecord.universalIdentifier,
  STANDARD_COMMAND_MENU_ITEMS.createNewCompanyRecord.universalIdentifier,
  STANDARD_COMMAND_MENU_ITEMS.createNewOpportunityRecord.universalIdentifier,
  STANDARD_COMMAND_MENU_ITEMS.createNewTaskRecord.universalIdentifier,
  STANDARD_COMMAND_MENU_ITEMS.createNewNoteRecord.universalIdentifier,
];

const GENERIC_CREATE_NEW_RECORD_UNIVERSAL_IDENTIFIER =
  STANDARD_COMMAND_MENU_ITEMS.createNewRecord.universalIdentifier;

@RegisteredWorkspaceCommand('2.35.0', 1789556201000)
@Command({
  name: 'upgrade:2-35:add-gendered-create-new-record-command-menu-items',
  description:
    'Adds dedicated "New Person/Company/Opportunity/Task/Note" command menu items with their own translatable strings, and excludes these objects from the generic "New {object}" command, so pt-BR (and other gendered languages) can translate the button correctly',
})
export class AddGenderedCreateNewRecordCommandMenuItemsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { flatCommandMenuItemMaps: existingFlatCommandMenuItemMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatCommandMenuItemMaps',
      ]);

    const { allFlatEntityMaps: standardAllFlatEntityMaps } =
      computeTwentyStandardApplicationAllFlatEntityMaps({
        now: new Date().toISOString(),
        workspaceId,
        twentyStandardApplicationId: twentyStandardFlatApplication.id,
      });

    const itemsToCreate = NEW_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIERS.filter(
      (universalIdentifier) =>
        !isDefined(
          existingFlatCommandMenuItemMaps.byUniversalIdentifier[
            universalIdentifier
          ],
        ),
    )
      .map(
        (universalIdentifier) =>
          standardAllFlatEntityMaps.flatCommandMenuItemMaps
            .byUniversalIdentifier[universalIdentifier],
      )
      .filter((item): item is FlatCommandMenuItem => isDefined(item));

    const existingGenericCreateNewRecord =
      existingFlatCommandMenuItemMaps.byUniversalIdentifier[
        GENERIC_CREATE_NEW_RECORD_UNIVERSAL_IDENTIFIER
      ];
    const standardGenericCreateNewRecord =
      standardAllFlatEntityMaps.flatCommandMenuItemMaps.byUniversalIdentifier[
        GENERIC_CREATE_NEW_RECORD_UNIVERSAL_IDENTIFIER
      ];

    const itemsToUpdate =
      isDefined(existingGenericCreateNewRecord) &&
      isDefined(standardGenericCreateNewRecord) &&
      existingGenericCreateNewRecord.conditionalAvailabilityExpression !==
        standardGenericCreateNewRecord.conditionalAvailabilityExpression
        ? [
            {
              ...existingGenericCreateNewRecord,
              conditionalAvailabilityExpression:
                standardGenericCreateNewRecord.conditionalAvailabilityExpression,
            },
          ]
        : [];

    const totalOperationCount = itemsToCreate.length + itemsToUpdate.length;

    if (totalOperationCount === 0) {
      this.logger.log(
        `Gendered create-new-record command menu items already configured for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Adding gendered create-new-record command menu items (${itemsToCreate.length} to add, ${itemsToUpdate.length} to realign) for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      return;
    }

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          isSystemBuild: true,
          allFlatEntityOperationByMetadataName: {
            commandMenuItem: {
              flatEntityToCreate: itemsToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: itemsToUpdate,
            },
          },
          workspaceId,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new Error(
        `Failed to add gendered create-new-record command menu items for workspace ${workspaceId}: ${JSON.stringify(
          validateAndBuildResult,
          null,
          2,
        )}`,
      );
    }

    this.logger.log(
      `Added gendered create-new-record command menu items for workspace ${workspaceId}`,
    );
  }
}
