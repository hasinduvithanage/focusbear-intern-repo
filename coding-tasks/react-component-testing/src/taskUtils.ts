// ---------------------------------------------------------------
// TASK UTILITIES
//
// Pure utility functions for task-related calculations.
// No React, no components, no state — just input → output.
//
// These are the simplest things to test because they're pure
// functions: same input always gives same output, no side effects.
// ---------------------------------------------------------------

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  focusMinutes: number;
}

// ---------------------------------------------------------------
// 1. BASIC MATH — Add two numbers
//
// Starting with the simplest possible function to show the
// testing pattern before adding complexity.
// ---------------------------------------------------------------

export function add(a: number, b: number): number {
  return a + b;
}

// ---------------------------------------------------------------
// 2. COUNT COMPLETED TASKS
//
// Takes an array of tasks, returns how many are completed.
// ---------------------------------------------------------------

export function countCompleted(tasks: Task[]): number {
  return tasks.filter((t) => t.completed).length;
}

// ---------------------------------------------------------------
// 3. TOTAL FOCUS TIME
//
// Sums up focusMinutes across all tasks (or only completed ones).
// ---------------------------------------------------------------

export function totalFocusMinutes(tasks: Task[], completedOnly: boolean = false): number {
  const filtered = completedOnly ? tasks.filter((t) => t.completed) : tasks;
  return filtered.reduce((sum, task) => sum + task.focusMinutes, 0);
}

// ---------------------------------------------------------------
// 4. FORMAT FOCUS TIME
//
// Converts minutes into a human-readable string.
//   0  → "0 minutes"
//   45 → "45 minutes"
//   60 → "1 hour"
//   90 → "1 hour 30 minutes"
//   150 → "2 hours 30 minutes"
// ---------------------------------------------------------------

export function formatFocusTime(minutes: number): string {
  if (minutes < 0) {
    throw new Error('Minutes cannot be negative');
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes} minutes`;
  }

  if (remainingMinutes === 0) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  }

  return `${hours} ${hours === 1 ? 'hour' : 'hours'} ${remainingMinutes} minutes`;
}

// ---------------------------------------------------------------
// 5. GET TASKS BY PRIORITY
//
// Filters tasks by a given priority level.
// ---------------------------------------------------------------

export function getTasksByPriority(tasks: Task[], priority: Task['priority']): Task[] {
  return tasks.filter((t) => t.priority === priority);
}

// ---------------------------------------------------------------
// 6. CALCULATE COMPLETION PERCENTAGE
//
// Returns a percentage (0-100) of how many tasks are completed.
// Returns 0 for an empty array (avoids division by zero).
// ---------------------------------------------------------------

export function completionPercentage(tasks: Task[]): number {
  if (tasks.length === 0) {
    return 0;
  }

  return Math.round((countCompleted(tasks) / tasks.length) * 100);
}