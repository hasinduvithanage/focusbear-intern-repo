// ---------------------------------------------------------------
// TASK UTILS — Directly imported utility functions
//
// These are NOT injectable services. They're plain functions
// imported with `import { ... } from './task.utils'`.
//
// Since they don't go through NestJS dependency injection,
// you can't replace them with { provide: ..., useValue: ... }.
// Instead, you use jest.mock('./task.utils') in tests.
//
// This is the key difference from services and repositories.
// ---------------------------------------------------------------

export function generateTaskSummary(title: string, completed: boolean): string {
  const status = completed ? 'DONE' : 'PENDING';
  return `[${status}] ${title}`;
}

export function calculatePriorityScore(
  priority: 'low' | 'medium' | 'high',
  completed: boolean,
): number {
  const baseScores = { low: 1, medium: 5, high: 10 };
  const score = baseScores[priority];
  return completed ? 0 : score;
}
