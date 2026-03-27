// ---------------------------------------------------------------
// TASK TYPES AND REPOSITORY
//
// In your 7.1 project, Task is a TypeORM entity and the repository
// is provided by TypeOrmModule.forFeature([Task]).
//
// For this testing exercise, we define a simple interface and
// an injectable repository class. The testing pattern is identical
// — we mock the repository methods the same way.
// ---------------------------------------------------------------

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
}

// This mimics the subset of TypeORM Repository methods that
// TasksService uses. In tests, we replace every method with jest.fn().
export interface TaskRepository {
  create(data: Partial<Task>): Task;
  save(task: Task): Promise<Task>;
  find(): Promise<Task[]>;
  findOneBy(criteria: Partial<Task>): Promise<Task | null>;
  remove(task: Task): Promise<Task>;
}
