import 'reflect-metadata';
import AppDataSource from '../data-source';
import { Task, TaskPriority } from '../tasks/task.entity';

// ---------------------------------------------------------------
// SEED SCRIPT
//
// Connects directly to PostgreSQL using the DataSource (bypasses
// NestJS entirely) and inserts sample tasks via the repository.
//
// Run with:  npm run seed
//
// WHY repositories instead of raw SQL?
//   - Validates data against your entity decorators
//   - Applies default values (completed, createdAt, etc.)
//   - Returns typed entity instances
//   - Fires lifecycle hooks (@BeforeInsert) if you add them later
// ---------------------------------------------------------------

const sampleTasks: Partial<Task>[] = [
  {
    title: 'Set up morning routine',
    description: 'Configure Focus Bear to block social media from 6-8 AM',
    completed: false,
    priority: TaskPriority.HIGH,
  },
  {
    title: 'Review weekly goals',
    description: 'Check progress on all habit-building goals for the week',
    completed: false,
    priority: TaskPriority.MEDIUM,
  },
  {
    title: 'Update focus session duration',
    description: 'Change Pomodoro timer from 25 to 30 minutes based on user feedback',
    completed: true,
    priority: TaskPriority.LOW,
  },
  {
    title: 'Write unit tests for auth module',
    description: 'Cover login, signup, and token refresh endpoints with Jest tests',
    completed: false,
    priority: TaskPriority.HIGH,
  },
  {
    title: 'Fix notification timing bug',
    description: 'Notifications fire 5 minutes late on Android 14 devices',
    completed: false,
    priority: TaskPriority.HIGH,
  },
];

async function seed() {
  // 1. Open the database connection
  await AppDataSource.initialize();
  console.log('Connected to database.\n');

  // 2. Get the repository
  const taskRepo = AppDataSource.getRepository(Task);

  // 3. Clear existing data (makes the seed idempotent)
  await taskRepo.clear();
  console.log('Cleared existing tasks.');

  // 4. Insert sample data
  //    .create() builds entity instances (applies defaults, validates)
  //    .save()   persists them to PostgreSQL
  const tasks = taskRepo.create(sampleTasks);
  const saved = await taskRepo.save(tasks);

  console.log(`Seeded ${saved.length} tasks:\n`);
  saved.forEach((t) => {
    console.log(`  [${t.priority.toUpperCase().padEnd(6)}] ${t.title}`);
    console.log(`           completed: ${t.completed}, id: ${t.id}`);
  });

  // 5. Verify
  const count = await taskRepo.count();
  console.log(`\nTotal tasks in database: ${count}`);

  // 6. Close the connection
  await AppDataSource.destroy();
  console.log('Connection closed.');
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});