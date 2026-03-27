// ---------------------------------------------------------------
// TASK UTILITIES — TEST SUITE
//
// Testing pure functions is the simplest form of unit testing.
// No render(), no screen, no waitFor, no mocking.
// Just: call the function → check the return value.
//
// Every test follows:
//   1. Set up the input
//   2. Call the function
//   3. Check the output with expect()
// ---------------------------------------------------------------

import {
  add,
  countCompleted,
  totalFocusMinutes,
  formatFocusTime,
  getTasksByPriority,
  completionPercentage,
  Task,
} from '../src/taskUtils';

// ---------------------------------------------------------------
// SHARED TEST DATA
//
// Reusable task fixtures. Each test uses these or creates
// its own specific data as needed.
// ---------------------------------------------------------------

const mockTasks: Task[] = [
  { id: '1', title: 'Morning routine',  completed: true,  priority: 'high',   focusMinutes: 30 },
  { id: '2', title: 'Deep work block',  completed: true,  priority: 'high',   focusMinutes: 90 },
  { id: '3', title: 'Email cleanup',    completed: false, priority: 'low',    focusMinutes: 15 },
  { id: '4', title: 'Exercise',         completed: false, priority: 'medium', focusMinutes: 45 },
  { id: '5', title: 'Read chapter',     completed: true,  priority: 'medium', focusMinutes: 25 },
];

// =================================================================
// 1. add() — The simplest possible unit tests
// =================================================================

describe('add', () => {
  it('adds two positive numbers', () => {
    expect(add(2, 3)).toBe(5);
  });

  it('adds a positive and a negative number', () => {
    expect(add(10, -3)).toBe(7);
  });

  it('adds two negative numbers', () => {
    expect(add(-4, -6)).toBe(-10);
  });

  it('adds zero to a number', () => {
    expect(add(5, 0)).toBe(5);
  });

  it('adds two zeros', () => {
    expect(add(0, 0)).toBe(0);
  });

  it('handles decimal numbers', () => {
    expect(add(0.1, 0.2)).toBeCloseTo(0.3);
    // NOTE: toBeCloseTo instead of toBe because 0.1 + 0.2 === 0.30000000000000004
    // in JavaScript due to floating point precision. toBeCloseTo handles this.
  });
});

// =================================================================
// 2. countCompleted()
// =================================================================

describe('countCompleted', () => {
  it('counts completed tasks in a mixed list', () => {
    expect(countCompleted(mockTasks)).toBe(3);
  });

  it('returns 0 for an empty array', () => {
    expect(countCompleted([])).toBe(0);
  });

  it('returns 0 when no tasks are completed', () => {
    const allIncomplete: Task[] = [
      { id: '1', title: 'Task A', completed: false, priority: 'low', focusMinutes: 10 },
      { id: '2', title: 'Task B', completed: false, priority: 'low', focusMinutes: 20 },
    ];

    expect(countCompleted(allIncomplete)).toBe(0);
  });

  it('counts all when every task is completed', () => {
    const allDone: Task[] = [
      { id: '1', title: 'Done A', completed: true, priority: 'high', focusMinutes: 10 },
      { id: '2', title: 'Done B', completed: true, priority: 'high', focusMinutes: 20 },
    ];

    expect(countCompleted(allDone)).toBe(2);
  });
});

// =================================================================
// 3. totalFocusMinutes()
// =================================================================

describe('totalFocusMinutes', () => {
  it('sums focus minutes for all tasks', () => {
    // 30 + 90 + 15 + 45 + 25 = 205
    expect(totalFocusMinutes(mockTasks)).toBe(205);
  });

  it('sums only completed tasks when completedOnly is true', () => {
    // Completed: 30 + 90 + 25 = 145
    expect(totalFocusMinutes(mockTasks, true)).toBe(145);
  });

  it('returns 0 for an empty array', () => {
    expect(totalFocusMinutes([])).toBe(0);
  });

  it('returns 0 when filtering completed on all-incomplete list', () => {
    const incomplete: Task[] = [
      { id: '1', title: 'Nope', completed: false, priority: 'low', focusMinutes: 100 },
    ];

    expect(totalFocusMinutes(incomplete, true)).toBe(0);
  });
});

// =================================================================
// 4. formatFocusTime()
// =================================================================

describe('formatFocusTime', () => {
  it('formats zero minutes', () => {
    expect(formatFocusTime(0)).toBe('0 minutes');
  });

  it('formats minutes under an hour', () => {
    expect(formatFocusTime(45)).toBe('45 minutes');
  });

  it('formats exactly one hour', () => {
    expect(formatFocusTime(60)).toBe('1 hour');
  });

  it('formats exactly two hours (plural)', () => {
    expect(formatFocusTime(120)).toBe('2 hours');
  });

  it('formats hours and minutes combined', () => {
    expect(formatFocusTime(90)).toBe('1 hour 30 minutes');
  });

  it('formats large values', () => {
    expect(formatFocusTime(150)).toBe('2 hours 30 minutes');
  });

  it('throws for negative minutes', () => {
    expect(() => formatFocusTime(-5)).toThrow('Minutes cannot be negative');
  });
});

// =================================================================
// 5. getTasksByPriority()
// =================================================================

describe('getTasksByPriority', () => {
  it('filters high priority tasks', () => {
    const highTasks = getTasksByPriority(mockTasks, 'high');

    expect(highTasks).toHaveLength(2);
    expect(highTasks[0].title).toBe('Morning routine');
    expect(highTasks[1].title).toBe('Deep work block');
  });

  it('filters medium priority tasks', () => {
    const mediumTasks = getTasksByPriority(mockTasks, 'medium');

    expect(mediumTasks).toHaveLength(2);
  });

  it('filters low priority tasks', () => {
    const lowTasks = getTasksByPriority(mockTasks, 'low');

    expect(lowTasks).toHaveLength(1);
    expect(lowTasks[0].title).toBe('Email cleanup');
  });

  it('returns empty array when no tasks match', () => {
    const allHigh: Task[] = [
      { id: '1', title: 'Urgent', completed: false, priority: 'high', focusMinutes: 10 },
    ];

    expect(getTasksByPriority(allHigh, 'low')).toEqual([]);
  });

  it('returns empty array for empty input', () => {
    expect(getTasksByPriority([], 'high')).toEqual([]);
  });
});

// =================================================================
// 6. completionPercentage()
// =================================================================

describe('completionPercentage', () => {
  it('calculates percentage for a mixed list', () => {
    // 3 out of 5 = 60%
    expect(completionPercentage(mockTasks)).toBe(60);
  });

  it('returns 100 when all tasks are completed', () => {
    const allDone: Task[] = [
      { id: '1', title: 'A', completed: true, priority: 'low', focusMinutes: 10 },
      { id: '2', title: 'B', completed: true, priority: 'low', focusMinutes: 20 },
    ];

    expect(completionPercentage(allDone)).toBe(100);
  });

  it('returns 0 when no tasks are completed', () => {
    const noneDone: Task[] = [
      { id: '1', title: 'A', completed: false, priority: 'low', focusMinutes: 10 },
    ];

    expect(completionPercentage(noneDone)).toBe(0);
  });

  it('returns 0 for an empty array (no division by zero)', () => {
    expect(completionPercentage([])).toBe(0);
  });

  it('rounds to the nearest whole number', () => {
    // 1 out of 3 = 33.33... → rounds to 33
    const tasks: Task[] = [
      { id: '1', title: 'A', completed: true,  priority: 'low', focusMinutes: 10 },
      { id: '2', title: 'B', completed: false, priority: 'low', focusMinutes: 10 },
      { id: '3', title: 'C', completed: false, priority: 'low', focusMinutes: 10 },
    ];

    expect(completionPercentage(tasks)).toBe(33);
  });
});