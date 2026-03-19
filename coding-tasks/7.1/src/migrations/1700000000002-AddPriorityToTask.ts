import { MigrationInterface, QueryRunner } from 'typeorm';

// ---------------------------------------------------------------
// MIGRATION 2: Add "priority" column to the task table
//
// This represents a real schema evolution. In a normal workflow:
//   1. You'd add the priority field to task.entity.ts
//   2. Run: npx ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js migration:generate src/migrations/AddPriorityToTask -d src/data-source.ts
//   3. TypeORM diffs entity vs DB and generates this file
//   4. You review it, then run migration:run
//
// APPLY:  npm run migration:run
//   → runs up(): adds the enum type + column
//
// REVERT: npm run migration:revert
//   → runs down(): drops the column + enum type
//   → DB is back to the state after Migration 1
// ---------------------------------------------------------------

export class AddPriorityToTask1700000000002 implements MigrationInterface {
  name = 'AddPriorityToTask1700000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Create the PostgreSQL enum type
    await queryRunner.query(
      `CREATE TYPE "task_priority_enum" AS ENUM ('low', 'medium', 'high')`,
    );

    // Step 2: Add the column with a safe default for existing rows
    await queryRunner.query(
      `ALTER TABLE "task" ADD "priority" "task_priority_enum" NOT NULL DEFAULT 'medium'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert in reverse order: drop column first, then the type
    await queryRunner.query(
      `ALTER TABLE "task" DROP COLUMN "priority"`,
    );
    await queryRunner.query(
      `DROP TYPE "task_priority_enum"`,
    );
  }
}
