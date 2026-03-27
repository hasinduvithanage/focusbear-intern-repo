// ---------------------------------------------------------------
// TASKS SLICE — TEST SUITE
//
// Structure:
//   1. Action creator tests — verify action shapes (type + payload)
//   2. Reducer tests — verify state transitions for each action
//   3. Edge case tests — nonexistent IDs, empty state, unknown actions
//   4. Async thunk tests — pending/fulfilled/rejected lifecycle
//   5. Integration test — thunk dispatched through a real store
//
// PATTERN (every test follows this):
//   Given: [a known previous state]
//   When:  [an action is passed through the reducer]
//   Then:  [the returned state matches expectations]
//
// WHY TEST PURE FUNCTIONS?
//   Reducers are deterministic — same input always gives same output.
//   No mocks, no DOM, no network. Just function calls and assertions.
//   This makes them the easiest and most valuable code to test.
// ---------------------------------------------------------------

import { configureStore } from '@reduxjs/toolkit';
import tasksReducer, {
  initialState,
  addTask,
  toggleTask,
  removeTask,
  setPriority,
  fetchTasks,
  Task,
  TasksState,
} from '../src/tasksSlice';

// ---------------------------------------------------------------
// TEST FIXTURES
//
// Reusable task objects used across tests. Defined once here
// to keep individual tests focused on behaviour, not setup.
// Each test spreads these to avoid shared-reference issues.
// ---------------------------------------------------------------

const sampleTask: Task = {
  id: '1',
  title: 'Learn Redux Testing',
  description: 'Write tests for slices and thunks',
  completed: false,
  priority: 'medium',
};

const secondTask: Task = {
  id: '2',
  title: 'Build Focus Bear Frontend',
  description: 'Implement task management UI',
  completed: true,
  priority: 'high',
};

// Helper: creates a state with pre-loaded tasks
const stateWithTasks = (tasks: Task[]): TasksState => ({
  ...initialState,
  items: tasks.map((t) => ({ ...t })), // deep copy to prevent reference sharing
});

// =================================================================
// 1. ACTION CREATOR TESTS
// =================================================================

describe('action creators', () => {
  // ---------------------------------------------------------------
  // WHY TEST AUTO-GENERATED ACTION CREATORS?
  //
  // Redux Toolkit generates these from your reducer names, so they
  // "can't be wrong." But the action TYPE STRING (e.g. 'tasks/addTask')
  // is your slice's public contract. Other slices might listen for it
  // in extraReducers, middleware might match on it, and DevTools shows
  // it. If someone renames the slice from 'tasks' to 'todos', every
  // consumer breaks silently. This test catches that.
  // ---------------------------------------------------------------

  it('addTask() produces the correct action shape', () => {
    const action = addTask(sampleTask);

    expect(action).toEqual({
      type: 'tasks/addTask',
      payload: sampleTask,
    });
  });

  it('toggleTask() produces an action with task ID as payload', () => {
    const action = toggleTask('abc-123');

    expect(action).toEqual({
      type: 'tasks/toggleTask',
      payload: 'abc-123',
    });
  });

  it('removeTask() produces an action with task ID as payload', () => {
    expect(removeTask('xyz')).toEqual({
      type: 'tasks/removeTask',
      payload: 'xyz',
    });
  });

  it('setPriority() produces an action with id and priority in payload', () => {
    expect(setPriority({ id: '1', priority: 'high' })).toEqual({
      type: 'tasks/setPriority',
      payload: { id: '1', priority: 'high' },
    });
  });
});

// =================================================================
// 2. REDUCER TESTS — Synchronous State Transitions
// =================================================================

describe('tasksSlice reducer', () => {
  // ---------------------------------------------------------------
  // INITIAL STATE
  // ---------------------------------------------------------------

  describe('initial state', () => {
    it('returns the correct initial state for undefined input', () => {
      // When Redux initialises, it dispatches @@INIT with undefined state.
      // The reducer must return initialState without crashing.
      const result = tasksReducer(undefined, { type: 'unknown' });

      expect(result).toEqual(initialState);
      expect(result.items).toEqual([]);
      expect(result.loading).toBe(false);
      expect(result.error).toBeNull();
    });

    it('returns state unchanged for an unknown action type', () => {
      const existingState = stateWithTasks([sampleTask]);
      const result = tasksReducer(existingState, { type: 'completely/unknown' });

      expect(result).toEqual(existingState);
    });
  });

  // ---------------------------------------------------------------
  // addTask REDUCER
  // ---------------------------------------------------------------

  describe('addTask', () => {
    it('adds a task to an empty list', () => {
      const result = tasksReducer(initialState, addTask(sampleTask));

      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toEqual(sampleTask);
    });

    it('appends a task to an existing list (does not replace)', () => {
      const state = stateWithTasks([sampleTask]);

      const result = tasksReducer(state, addTask(secondTask));

      expect(result.items).toHaveLength(2);
      expect(result.items[0].id).toBe('1'); // original still first
      expect(result.items[1].id).toBe('2'); // new one appended
    });

    it('does not modify loading or error fields', () => {
      // This catches a common bug: a reducer accidentally spreading
      // over or resetting fields it shouldn't touch.
      const stateWithMeta: TasksState = {
        items: [],
        loading: true,
        error: 'some previous error',
      };

      const result = tasksReducer(stateWithMeta, addTask(sampleTask));

      expect(result.loading).toBe(true);       // untouched
      expect(result.error).toBe('some previous error'); // untouched
    });
  });

  // ---------------------------------------------------------------
  // toggleTask REDUCER
  // ---------------------------------------------------------------

  describe('toggleTask', () => {
    it('toggles an incomplete task to completed', () => {
      const state = stateWithTasks([{ ...sampleTask, completed: false }]);

      const result = tasksReducer(state, toggleTask('1'));

      expect(result.items[0].completed).toBe(true);
    });

    it('toggles a completed task back to incomplete', () => {
      const state = stateWithTasks([{ ...sampleTask, completed: true }]);

      const result = tasksReducer(state, toggleTask('1'));

      expect(result.items[0].completed).toBe(false);
    });

    it('only toggles the targeted task, leaving others unchanged', () => {
      const state = stateWithTasks([sampleTask, secondTask]);

      const result = tasksReducer(state, toggleTask('1'));

      // Task 1: toggled
      expect(result.items[0].completed).toBe(true);
      // Task 2: unchanged (was true, stays true)
      expect(result.items[1].completed).toBe(true);
      expect(result.items[1].title).toBe(secondTask.title);
    });

    it('returns state unchanged when task ID does not exist', () => {
      const state = stateWithTasks([sampleTask]);

      const result = tasksReducer(state, toggleTask('nonexistent'));

      expect(result.items).toEqual(state.items);
    });
  });

  // ---------------------------------------------------------------
  // removeTask REDUCER
  // ---------------------------------------------------------------

  describe('removeTask', () => {
    it('removes the task with the matching ID', () => {
      const state = stateWithTasks([sampleTask, secondTask]);

      const result = tasksReducer(state, removeTask('1'));

      expect(result.items).toHaveLength(1);
      expect(result.items[0].id).toBe('2');
    });

    it('returns an empty array when removing the only task', () => {
      const state = stateWithTasks([sampleTask]);

      const result = tasksReducer(state, removeTask('1'));

      expect(result.items).toHaveLength(0);
    });

    it('returns state unchanged when ID does not exist', () => {
      const state = stateWithTasks([sampleTask]);

      const result = tasksReducer(state, removeTask('nonexistent'));

      expect(result.items).toHaveLength(1);
      expect(result.items[0].id).toBe('1');
    });
  });

  // ---------------------------------------------------------------
  // setPriority REDUCER
  // ---------------------------------------------------------------

  describe('setPriority', () => {
    it('changes a task priority from medium to high', () => {
      const state = stateWithTasks([{ ...sampleTask, priority: 'medium' }]);

      const result = tasksReducer(state, setPriority({ id: '1', priority: 'high' }));

      expect(result.items[0].priority).toBe('high');
    });

    it('does not modify other tasks', () => {
      const state = stateWithTasks([sampleTask, secondTask]);

      const result = tasksReducer(state, setPriority({ id: '1', priority: 'low' }));

      expect(result.items[0].priority).toBe('low');
      expect(result.items[1].priority).toBe('high'); // unchanged
    });

    it('returns state unchanged when task ID does not exist', () => {
      const state = stateWithTasks([sampleTask]);

      const result = tasksReducer(state, setPriority({ id: 'ghost', priority: 'high' }));

      expect(result.items[0].priority).toBe('medium'); // unchanged
    });
  });
});

// =================================================================
// 3. ASYNC THUNK — Extra Reducer Tests (Pure, No Mocking Needed)
// =================================================================

describe('fetchTasks extra reducers', () => {
  // ---------------------------------------------------------------
  // TESTING APPROACH
  //
  // createAsyncThunk generates action creators for each lifecycle
  // phase: fetchTasks.pending, fetchTasks.fulfilled, fetchTasks.rejected.
  //
  // We call these directly to produce action objects, then pass them
  // through the reducer. No async code, no mocks, no store needed.
  // This tests the REDUCER LOGIC for async states, not the thunk itself.
  // ---------------------------------------------------------------

  it('sets loading=true and clears error on pending', () => {
    const stateWithError: TasksState = {
      items: [],
      loading: false,
      error: 'previous error',
    };

    // fetchTasks.pending(requestId, arg) — we provide dummy values
    const action = fetchTasks.pending('req-1', { apiFn: async () => [] });
    const result = tasksReducer(stateWithError, action);

    expect(result.loading).toBe(true);
    expect(result.error).toBeNull();    // cleared
    expect(result.items).toEqual([]);   // items untouched during loading
  });

  it('populates items and stops loading on fulfilled', () => {
    const loadingState: TasksState = { items: [], loading: true, error: null };
    const fetchedTasks: Task[] = [sampleTask, secondTask];

    const action = fetchTasks.fulfilled(fetchedTasks, 'req-1', { apiFn: async () => [] });
    const result = tasksReducer(loadingState, action);

    expect(result.loading).toBe(false);
    expect(result.items).toEqual(fetchedTasks);
    expect(result.error).toBeNull();
  });

  it('replaces existing items with fetched data (not appends)', () => {
    const stateWithOldData: TasksState = {
      items: [{ ...sampleTask, title: 'Old task' }],
      loading: true,
      error: null,
    };
    const freshTasks: Task[] = [secondTask];

    const action = fetchTasks.fulfilled(freshTasks, 'req-1', { apiFn: async () => [] });
    const result = tasksReducer(stateWithOldData, action);

    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe('2'); // old data replaced, not merged
  });

  it('sets error message and stops loading on rejected', () => {
    const loadingState: TasksState = { items: [], loading: true, error: null };

    // The third arg is the thunk arg, fourth is the rejected payload
    const action = fetchTasks.rejected(
      null,       // error object (we use rejectWithValue instead)
      'req-1',
      { apiFn: async () => [] },
      'Network error',  // this is the rejectWithValue payload
    );
    const result = tasksReducer(loadingState, action);

    expect(result.loading).toBe(false);
    expect(result.error).toBe('Network error');
    expect(result.items).toEqual([]); // items not corrupted by error
  });
});

// =================================================================
// 4. ASYNC THUNK — Integration Test (Real Store + Mock API)
// =================================================================

describe('fetchTasks thunk integration', () => {
  // ---------------------------------------------------------------
  // WHY AN INTEGRATION TEST?
  //
  // The extra-reducer tests above verify that the reducer responds
  // correctly to each lifecycle action in isolation. This integration
  // test verifies the FULL ROUND-TRIP:
  //   1. Dispatch the thunk
  //   2. Thunk calls the API function
  //   3. Thunk dispatches pending → fulfilled/rejected
  //   4. Reducer processes each dispatched action
  //   5. Final store state is correct
  //
  // We use a real Redux store (configureStore) with the real reducer.
  // Only the API function is mocked — everything else is production code.
  // ---------------------------------------------------------------

  const createTestStore = () =>
    configureStore({ reducer: { tasks: tasksReducer } });

  it('full success flow: dispatches pending then fulfilled', async () => {
    const store = createTestStore();
    const mockTasks: Task[] = [sampleTask, secondTask];

    // Mock API function that resolves successfully
    const mockApiFn = jest.fn().mockResolvedValue(mockTasks);

    await store.dispatch(fetchTasks({ apiFn: mockApiFn }));

    const state = store.getState().tasks;

    expect(mockApiFn).toHaveBeenCalledTimes(1);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.items).toEqual(mockTasks);
  });

  it('full failure flow: dispatches pending then rejected', async () => {
    const store = createTestStore();

    // Mock API function that rejects
    const mockApiFn = jest.fn().mockRejectedValue(new Error('Server down'));

    await store.dispatch(fetchTasks({ apiFn: mockApiFn }));

    const state = store.getState().tasks;

    expect(mockApiFn).toHaveBeenCalledTimes(1);
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Server down');
    expect(state.items).toEqual([]); // no data loaded
  });

  it('loading state is true while the thunk is in flight', async () => {
    const store = createTestStore();

    // Create a promise we control — lets us check state mid-flight
    let resolveApi!: (value: Task[]) => void;
    const controlledPromise = new Promise<Task[]>((resolve) => {
      resolveApi = resolve;
    });
    const mockApiFn = jest.fn().mockReturnValue(controlledPromise);

    // Dispatch but DON'T await — the thunk is now "in flight"
    const dispatchPromise = store.dispatch(fetchTasks({ apiFn: mockApiFn }));

    // Check mid-flight state
    expect(store.getState().tasks.loading).toBe(true);
    expect(store.getState().tasks.error).toBeNull();

    // Now resolve and let it complete
    resolveApi([sampleTask]);
    await dispatchPromise;

    // Check final state
    expect(store.getState().tasks.loading).toBe(false);
    expect(store.getState().tasks.items).toEqual([sampleTask]);
  });
});
