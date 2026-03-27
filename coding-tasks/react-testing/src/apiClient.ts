// ---------------------------------------------------------------
// API CLIENT
//
// A thin wrapper around fetch calls to your backend.
// In production, this would call your NestJS API (e.g. GET /tasks).
//
// WHY A SEPARATE MODULE?
// Isolating API calls into their own module gives us a clean
// seam for testing. We can jest.mock('./apiClient') to replace
// every function in this file with a mock — without touching
// the component code at all.
//
// The component imports { getTasks } from './apiClient' and
// calls it normally. It never knows whether it's talking to
// the real API or a mock.
// ---------------------------------------------------------------

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
}

const API_BASE = 'http://localhost:3000';

export async function getTasks(): Promise<Task[]> {
  const response = await fetch(`${API_BASE}/tasks`);

  if (!response.ok) {
    throw new Error(`Failed to fetch tasks: ${response.status}`);
  }

  return response.json();
}
