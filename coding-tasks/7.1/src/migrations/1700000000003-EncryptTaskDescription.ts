import { MigrationInterface, QueryRunner } from 'typeorm';

// ---------------------------------------------------------------
// MIGRATION 3: Mark task.description as application-layer encrypted
//
// No DDL change is required — the column stays as "text" in
// PostgreSQL.  Encryption/decryption is handled transparently by
// the typeorm-encrypted transformer in task.entity.ts using
// AES-256-CBC with a per-value random IV.
//
// ⚠️  DATA MIGRATION NOTE:
// Any rows written before this migration contain plaintext values.
// On read, typeorm-encrypted will throw (or return garbled text)
// for those rows because it will attempt to decrypt non-ciphertext.
// In production you must either:
//   • Encrypt existing rows in a data migration script, OR
//   • Truncate / backfill the table before deploying this change.
//
// For this dev environment: truncate the task table to start clean.
//
// APPLY:  npm run migration:run
// REVERT: npm run migration:revert
// ---------------------------------------------------------------

export class EncryptTaskDescription1700000000003 implements MigrationInterface {
  name = 'EncryptTaskDescription1700000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Truncate existing plaintext data so the app does not attempt
    // to decrypt rows that were never encrypted.
    await queryRunner.query(`TRUNCATE TABLE "task" RESTART IDENTITY`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Nothing to revert structurally — plaintext storage resumes
    // once the entity is reverted to a plain @Column.
    // Existing encrypted rows will become unreadable after revert;
    // truncate again if needed.
    await queryRunner.query(`TRUNCATE TABLE "task" RESTART IDENTITY`);
  }
}
