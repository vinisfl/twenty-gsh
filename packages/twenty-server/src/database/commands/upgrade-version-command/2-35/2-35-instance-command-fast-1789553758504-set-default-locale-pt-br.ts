import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.35.0', 1789553758504)
export class SetDefaultLocalePtBrFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."user" ALTER COLUMN "locale" SET DEFAULT 'pt-BR'`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" ALTER COLUMN "locale" SET DEFAULT 'pt-BR'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."user" ALTER COLUMN "locale" SET DEFAULT 'en'`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" ALTER COLUMN "locale" SET DEFAULT 'en'`,
    );
  }
}
