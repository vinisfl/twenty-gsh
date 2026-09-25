import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.35.0', 1787935762896)
export class AddCountAndSumAggregateOperationFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TYPE "core"."view_kanbanaggregateoperation_enum" RENAME TO "view_kanbanaggregateoperation_enum_old"');
    await queryRunner.query('CREATE TYPE "core"."view_kanbanaggregateoperation_enum" AS ENUM(\'MIN\', \'MAX\', \'AVG\', \'SUM\', \'COUNT\', \'COUNT_AND_SUM\', \'COUNT_UNIQUE_VALUES\', \'COUNT_EMPTY\', \'COUNT_NOT_EMPTY\', \'COUNT_TRUE\', \'COUNT_FALSE\', \'PERCENTAGE_EMPTY\', \'PERCENTAGE_NOT_EMPTY\')');
    await queryRunner.query('ALTER TABLE "core"."view" ALTER COLUMN "kanbanAggregateOperation" TYPE "core"."view_kanbanaggregateoperation_enum" USING "kanbanAggregateOperation"::"text"::"core"."view_kanbanaggregateoperation_enum"');
    await queryRunner.query('DROP TYPE "core"."view_kanbanaggregateoperation_enum_old"');
    await queryRunner.query('ALTER TYPE "core"."viewField_aggregateoperation_enum" RENAME TO "viewField_aggregateoperation_enum_old"');
    await queryRunner.query('CREATE TYPE "core"."viewField_aggregateoperation_enum" AS ENUM(\'MIN\', \'MAX\', \'AVG\', \'SUM\', \'COUNT\', \'COUNT_AND_SUM\', \'COUNT_UNIQUE_VALUES\', \'COUNT_EMPTY\', \'COUNT_NOT_EMPTY\', \'COUNT_TRUE\', \'COUNT_FALSE\', \'PERCENTAGE_EMPTY\', \'PERCENTAGE_NOT_EMPTY\')');
    await queryRunner.query('ALTER TABLE "core"."viewField" ALTER COLUMN "aggregateOperation" TYPE "core"."viewField_aggregateoperation_enum" USING "aggregateOperation"::"text"::"core"."viewField_aggregateoperation_enum"');
    await queryRunner.query('DROP TYPE "core"."viewField_aggregateoperation_enum_old"');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "core"."viewField" SET "aggregateOperation" = 'SUM' WHERE "aggregateOperation" = 'COUNT_AND_SUM'`,
    );
    await queryRunner.query('CREATE TYPE "core"."viewField_aggregateoperation_enum_old" AS ENUM(\'MIN\', \'MAX\', \'AVG\', \'SUM\', \'COUNT\', \'COUNT_UNIQUE_VALUES\', \'COUNT_EMPTY\', \'COUNT_NOT_EMPTY\', \'COUNT_TRUE\', \'COUNT_FALSE\', \'PERCENTAGE_EMPTY\', \'PERCENTAGE_NOT_EMPTY\')');
    await queryRunner.query('ALTER TABLE "core"."viewField" ALTER COLUMN "aggregateOperation" TYPE "core"."viewField_aggregateoperation_enum_old" USING "aggregateOperation"::"text"::"core"."viewField_aggregateoperation_enum_old"');
    await queryRunner.query('DROP TYPE "core"."viewField_aggregateoperation_enum"');
    await queryRunner.query('ALTER TYPE "core"."viewField_aggregateoperation_enum_old" RENAME TO "viewField_aggregateoperation_enum"');
    await queryRunner.query(
      `UPDATE "core"."view" SET "kanbanAggregateOperation" = 'SUM' WHERE "kanbanAggregateOperation" = 'COUNT_AND_SUM'`,
    );
    await queryRunner.query('CREATE TYPE "core"."view_kanbanaggregateoperation_enum_old" AS ENUM(\'MIN\', \'MAX\', \'AVG\', \'SUM\', \'COUNT\', \'COUNT_UNIQUE_VALUES\', \'COUNT_EMPTY\', \'COUNT_NOT_EMPTY\', \'COUNT_TRUE\', \'COUNT_FALSE\', \'PERCENTAGE_EMPTY\', \'PERCENTAGE_NOT_EMPTY\')');
    await queryRunner.query('ALTER TABLE "core"."view" ALTER COLUMN "kanbanAggregateOperation" TYPE "core"."view_kanbanaggregateoperation_enum_old" USING "kanbanAggregateOperation"::"text"::"core"."view_kanbanaggregateoperation_enum_old"');
    await queryRunner.query('DROP TYPE "core"."view_kanbanaggregateoperation_enum"');
    await queryRunner.query('ALTER TYPE "core"."view_kanbanaggregateoperation_enum_old" RENAME TO "view_kanbanaggregateoperation_enum"');
  }
}
