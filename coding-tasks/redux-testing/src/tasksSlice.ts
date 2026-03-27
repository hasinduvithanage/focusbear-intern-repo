// ---------------------------------------------------------------
// TASKS SLICE — Redux Toolkit slice for task management
//
// This mirrors the backend Task entity from your 7.1 NestJS project,
// but from the frontend's perspective. It manages:
//   - A list of tasks (items)
//   - Loading/error state for async operations
//   - Sync actions: add, toggle, remove, setPriority
//   - Async action: fetchTasks (simulates an API call)
//
// KEY CONCEPTS:
//   - createSlice: bundles reducers + action creators + action types
//   - PayloadAction<T>: type-safe action payloads
//   - createAsyncThunk: handles pending/fulfilled/rejected lifecycle
//   - Immer: allows "mutating" syntax that produces immutable updates
// ---------------------------------------------------------------

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// ---------------------------------------------------------------
// TYPES
// ---------------------------------------------------------------

export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: Priority;
}

export interface TasksState {
  items: Task[];
  loading: boolean;
  error: string | null;
}

// ---------------------------------------------------------------
// INITIAL STATE
// ---------------------------------------------------------------

export const initialState: TasksState = {
  items: [],
  loading: false,
  error: null,
};

// ---------------------------------------------------------------
// ASYNC THUNK — fetchTasks
//
// In a real app, `apiFn` would be an injected API client.
// We accept it as a parameter so tests can provide a mock
// without needing jest.mock() on a module — this is called
// "dependency injection via thunk argument."
//
// The thunk dispatches three action types automatically:
//   - tasks/fetchTasks/pending   → when the promise starts
//   - tasks/fetchTasks/fulfilled → when the promise resolves
//   - tasks/fetchTasks/rejected  → when the promise rejects
// ---------------------------------------------------------------

export const fetchTasks = createAsyncThunk<
  Task[],                          // Return type on success (fulfilled payload)
  { apiFn: () => Promise<Task[]> } // Argument type (what you pass when dispatching)
>(
  'tasks/fetchTasks',
  async ({ apiFn }, { rejectWithValue }) => {
    try {
      const tasks = await apiFn();
      return tasks;
    } catch (err: any) {
      return rejectWithValue(err.message ?? 'Failed to fetch tasks');
    }
  },
);

// ---------------------------------------------------------------
// SLICE DEFINITION
// ---------------------------------------------------------------

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    // Add a new task to the list
    addTask(state, action: PayloadAction<Task>) {
      state.items.push(action.payload);
    },

    // Toggle a task's completed status by ID
    toggleTask(state, action: PayloadAction<string>) {
      const task = state.items.find((t) => t.id === action.payload);
      if (task) {
        task.completed = !task.completed;
      }
    },

    // Remove a task by ID
    removeTask(state, action: PayloadAction<string>) {
      state.items = state.items.filter((t) => t.id !== action.payload);
    },

    // Change a task's priority by ID
    setPriority(state, action: PayloadAction<{ id: string; priority: Priority }>) {
      const task = state.items.find((t) => t.id === action.payload.id);
      if (task) {
        task.priority = action.payload.priority;
      }
    },
  },

  // ---------------------------------------------------------------
  // EXTRA REDUCERS — handle the async thunk lifecycle
  //
  // These respond to the auto-generated action types from fetchTasks.
  // Each case handles one phase of the async operation.
  // ---------------------------------------------------------------
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? 'Unknown error';
      });
  },
});

// ---------------------------------------------------------------
// EXPORTS
//
// Export pattern:
//   - Named exports for action creators (used by components to dispatch)
//   - Default export for the reducer (used by the store)
//   - Named export for initialState (used by tests)
// ---------------------------------------------------------------

export const { addTask, toggleTask, removeTask, setPriority } = tasksSlice.actions;
export default tasksSlice.reducer;
