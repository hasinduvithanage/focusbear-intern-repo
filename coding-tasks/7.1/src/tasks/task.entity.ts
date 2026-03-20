import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EncryptionTransformer } from 'typeorm-encrypted';

// ---------------------------------------------------------------
// The entity must ALWAYS reflect the latest schema state.
// After Migration 2 adds the "priority" column, we add it here
// so the entity and database stay in sync.
// ---------------------------------------------------------------

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

// ---------------------------------------------------------------
// ENCRYPTION CONFIG
//
// ENCRYPTION_KEY must be a 64-char hex string (32 bytes) loaded
// from .env before this module is first imported (guaranteed by
// `import 'dotenv/config'` at the top of main.ts).
//
// Algorithm: AES-256-CBC  •  IV length: 16 bytes (auto-generated
// per value, prepended to the ciphertext before base64 encoding).
//
// Only `description` is encrypted — it may contain sensitive task
// notes.  `title` stays plaintext so it remains searchable.
//
// Generate a fresh key for production:
//   openssl rand -hex 32
// ---------------------------------------------------------------
const descriptionTransformer = new EncryptionTransformer({
  key: process.env.ENCRYPTION_KEY as string,
  algorithm: 'aes-256-cbc',
  ivLength: 16,
});

@Entity()
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  // Stored as AES-256-CBC ciphertext (base64). Column type stays
  // `text` in PostgreSQL — no schema migration needed.
  @Column({ type: 'text', default: '', transformer: descriptionTransformer })
  description: string;

  @Column({ type: 'boolean', default: false })
  completed: boolean;

  // NEW — added alongside Migration 2
  @Column({
    type: 'enum',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  priority: TaskPriority;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}