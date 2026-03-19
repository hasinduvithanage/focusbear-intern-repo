import { MigrationInterface, QueryRunner } from 'typeorm';

// ---------------------------------------------------------------
// MIGRATION 1: BASELINE — Captures the existing "task" table
//
// CONTEXT: Your database already has the "task" table because
// synchronize:true created it. This migration codifies that
// existing schema so the migration history starts from a known
// state.
//
// HOW TO HANDLE THIS:
//   1. Add this file to src/migrations/
//   2. DON'T run migration:run yet (the table already exists!)
//   3. Instead, mark it as already applied by inserting a row
//      into the migrations table manually (see instructions below)
//
// After this baseline is recorded, all FUTURE migrations will
// be generated and applied normally with migration:run.
// ---------------------------------------------------------------

export class CreateTaskTable1700000000001 implements MigrationInterface {
  name = 'CreateTaskTable1700000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable uuid generation
    await queryRunner.query(
      `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`,
    );

    await queryRunner.query(`
      CREATE TABLE "task" (
        "id"          uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title"       character varying(255) NOT NULL,
        "description" text NOT NULL DEFAULT '',
        "completed"   boolean NOT NULL DEFAULT false,
        "createdAt"   TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt"   TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_fb213f79ee45060ba925ecd576e" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "task"`);
  }
}
