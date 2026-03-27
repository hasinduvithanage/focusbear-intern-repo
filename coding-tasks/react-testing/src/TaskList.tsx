// ---------------------------------------------------------------
// TASK LIST COMPONENT
//
// A React component that:
//   1. Shows "Loading tasks..." while fetching
//   2. Calls getTasks() from apiClient on mount
//   3. Displays the list of tasks on success
//   4. Shows an error message on failure
//
// This component has THREE distinct UI states:
//   - Loading state  → spinner/message while API call is in flight
//   - Success state  → list of tasks rendered
//   - Error state    → error message displayed
//
// Each state is testable independently by controlling what the
// mocked API returns (resolved data, rejected error, or a
// pending promise).
//
// DESIGN CHOICES FOR TESTABILITY:
//   - Uses role="status" on the loading message so tests can
//     find it with getByRole('status')
//   - Uses role="alert" on the error message
//   - Uses role="list" and role="listitem" for the task list
//   - Each task shows a visual indicator for completion status
//   - These semantic roles make tests read like plain English
// ---------------------------------------------------------------

import React, { useEffect, useState } from 'react';
import { getTasks, Task } from './apiClient';

export function TaskList() {
  // ---------------------------------------------------------------
  // STATE
  //
  // Three pieces of state mirror the same pattern from the Redux
  // slice exercise: items (the data), loading (are we fetching?),
  // and error (did something go wrong?).
  //
  // The difference: in Redux, this lived in the store. Here it's
  // local component state with useState. Same concept, different
  // location.
  // ---------------------------------------------------------------
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // ---------------------------------------------------------------
  // DATA FETCHING — useEffect
  //
  // useEffect with an empty dependency array [] runs ONCE after
  // the component first renders (mounts). This is where we fetch
  // data from the API.
  //
  // The flow:
  //   1. Component renders with loading=true (initial state)
  //   2. useEffect fires → calls getTasks()
  //   3a. On success → setTasks(data), setLoading(false)
  //   3b. On failure → setError(message), setLoading(false)
  // ---------------------------------------------------------------
  useEffect(() => {
    async function loadTasks() {
      try {
        const data = await getTasks();
        setTasks(data);
      } catch (err: any) {
        setError(err.message ?? 'Something went wrong');
      } finally {
        // finally block runs whether the try succeeded or failed.
        // Loading should stop in BOTH cases.
        setLoading(false);
      }
    }

    loadTasks();
  }, []);

  // ---------------------------------------------------------------
  // RENDER — Loading State
  // ---------------------------------------------------------------
  if (loading) {
    return <p role="status">Loading tasks...</p>;
  }

  // ---------------------------------------------------------------
  // RENDER — Error State
  // ---------------------------------------------------------------
  if (error) {
    return <p role="alert">Error: {error}</p>;
  }

  // ---------------------------------------------------------------
  // RENDER — Empty State
  // ---------------------------------------------------------------
  if (tasks.length === 0) {
    return <p>No tasks found.</p>;
  }

  // ---------------------------------------------------------------
  // RENDER — Success State (tasks loaded)
  // ---------------------------------------------------------------
  return (
    <div>
      <h2>Tasks ({tasks.length})</h2>
      <ul role="list">
        {tasks.map((task) => (
          <li key={task.id} role="listitem">
            <span>{task.completed ? '✅' : '⬜'}</span>
            <strong> {task.title}</strong>
            <span> — {task.priority}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
