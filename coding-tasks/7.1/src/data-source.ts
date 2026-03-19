import { DataSource } from 'typeorm';
import { Task } from './tasks/task.entity';
import * as dotenv from 'dotenv';

// Load .env so the CLI picks up your DB credentials
dotenv.config();

// ---------------------------------------------------------------
// WHY THIS FILE EXISTS:
//
// The TypeORM CLI (migration:generate, migration:run, etc.) runs
// OUTSIDE of NestJS — it doesn't boot your app. So it can't read
// the TypeOrmModule config in app.module.ts.
//
// This file gives the CLI its own DataSource with the same DB
// connection details. You must keep both in sync.
//
// The CLI uses this via the -d flag:
//   npx typeorm migration:run -d src/data-source.ts
// ---------------------------------------------------------------

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5433', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'focusbear_dev',

  entities: [Task],
  migrations: ['src/migrations/*.ts'],

  // Must be false — migrations handle schema changes now
  synchronize: false,

  logging: true,
});

export default AppDataSource;