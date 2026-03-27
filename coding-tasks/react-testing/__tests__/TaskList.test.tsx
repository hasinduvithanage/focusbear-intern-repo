// ---------------------------------------------------------------
// TASK LIST COMPONENT — TEST SUITE
//
// This file tests the TaskList component by mocking the API client.
// No real HTTP requests are made. We control exactly what getTasks()
// returns, and verify the component renders the correct UI for each
// scenario.
//
// TOOLS USED:
//   - jest.mock()           → replaces apiClient module with mocks
//   - @testing-library/react → renders components and queries the DOM
//   - @testing-library/jest-dom → adds DOM-specific matchers (toBeInTheDocument)
//
// TESTING LIBRARY PHILOSOPHY:
//   "Test the way users interact with your app."
//   We don't check state variables or implementation details.
//   We check what appears on screen — just like a user would.
// ---------------------------------------------------------------

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TaskList } from '../src/TaskList';
import { getTasks, Task } from '../src/apiClient';

// ---------------------------------------------------------------
// MOCK THE API CLIENT MODULE
//
// jest.mock('../src/apiClient') tells Jest:
//   "When any code imports from '../src/apiClient', don't use the
//    real module. Replace every export with a jest.fn()."
//
// After this line, getTasks is no longer the real function that
// calls fetch(). It's a jest.fn() that we can configure.
//
// The cast (getTasks as jest.MockedFunction<typeof getTasks>) gives
// TypeScript the right type — it knows getTasks is now a mock with
// methods like .mockResolvedValue() available.
// ---------------------------------------------------------------

jest.mock('../src/apiClient');

const mockedGetTasks = getTasks as jest.MockedFunction<typeof getTasks>;

// ---------------------------------------------------------------
// RESET MOCKS BETWEEN TESTS
//
// Each test configures the mock differently (success, error, etc).
// Without resetting, configuration from test 1 would leak into
// test 2. beforeEach ensures a clean slate.
// ---------------------------------------------------------------

beforeEach(() => {
  jest.resetAllMocks();
});

// ---------------------------------------------------------------
// TEST DATA (fixtures)
// ---------------------------------------------------------------

const mockTasks: Task[] = [
  { id: '1', title: 'Learn React Testing', completed: false, priority: 'high' },
  { id: '2', title: 'Build Focus Bear UI', completed: true, priority: 'medium' },
  { id: '3', title: 'Write documentation', completed: false, priority: 'low' },
];

// =================================================================
// TEST SUITE
// =================================================================

describe('TaskList component', () => {
  // ---------------------------------------------------------------
  // TEST 1: LOADING STATE
  //
  // When the component first renders, it should show a loading
  // message while the API call is in flight.
  //
  // TRICK: We make getTasks return a promise that NEVER resolves.
  // This freezes the component in the loading state so we can
  // assert on it. Without this, the promise would resolve instantly
  // (mock default) and we'd miss the loading state entirely.
  // ---------------------------------------------------------------

  it('shows loading message while fetching', () => {
    // A promise that never resolves — keeps the component in loading state
    mockedGetTasks.mockReturnValue(new Promise(() => {}));

    render(<TaskList />);

    // getByRole finds elements by their ARIA role.
    // Our loading <p> has role="status".
    const loadingMessage = screen.getByRole('status');
    expect(loadingMessage).toBeInTheDocument();
    expect(loadingMessage).toHaveTextContent('Loading tasks...');
  });

  // ---------------------------------------------------------------
  // TEST 2: SUCCESS STATE — Tasks Displayed
  //
  // After the API returns data, the component should:
  //   - Stop showing the loading message
  //   - Display each task with its title, status, and priority
  //   - Show the correct count in the heading
  //
  // ASYNC TESTING PATTERN:
  //   render() triggers the component to mount → useEffect fires →
  //   getTasks() is called → our mock resolves with mockTasks →
  //   component re-renders with data.
  //
  //   But this all happens asynchronously. We need waitFor() to
  //   tell Testing Library: "keep checking until this assertion
  //   passes (or timeout)." Without waitFor, the test would check
  //   the DOM immediately after render — before the data arrives.
  // ---------------------------------------------------------------

  it('displays tasks after successful fetch', async () => {
    mockedGetTasks.mockResolvedValue(mockTasks);

    render(<TaskList />);

    // waitFor retries the callback until it passes or times out (1s default).
    // This handles the async gap between render and data arriving.
    await waitFor(() => {
      expect(screen.getByText('Tasks (3)')).toBeInTheDocument();
    });

    // Now verify each task is displayed
    expect(screen.getByText('Learn React Testing')).toBeInTheDocument();
    expect(screen.getByText('Build Focus Bear UI')).toBeInTheDocument();
    expect(screen.getByText('Write documentation')).toBeInTheDocument();

    // Verify the loading message is gone
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  // ---------------------------------------------------------------
  // TEST 3: COMPLETION STATUS ICONS
  //
  // Verify that completed tasks show ✅ and incomplete tasks show ⬜.
  // We use getAllByRole('listitem') to get all <li> elements, then
  // check each one's text content.
  // ---------------------------------------------------------------

  it('shows correct completion icons for each task', async () => {
    mockedGetTasks.mockResolvedValue(mockTasks);

    render(<TaskList />);

    await waitFor(() => {
      expect(screen.getByText('Tasks (3)')).toBeInTheDocument();
    });

    const listItems = screen.getAllByRole('listitem');

    // Task 1: incomplete → ⬜
    expect(listItems[0]).toHaveTextContent('⬜');
    expect(listItems[0]).toHaveTextContent('Learn React Testing');

    // Task 2: completed → ✅
    expect(listItems[1]).toHaveTextContent('✅');
    expect(listItems[1]).toHaveTextContent('Build Focus Bear UI');

    // Task 3: incomplete → ⬜
    expect(listItems[2]).toHaveTextContent('⬜');
  });

  // ---------------------------------------------------------------
  // TEST 4: PRIORITY LABELS
  //
  // Each task should display its priority level.
  // ---------------------------------------------------------------

  it('displays priority for each task', async () => {
    mockedGetTasks.mockResolvedValue(mockTasks);

    render(<TaskList />);

    await waitFor(() => {
      expect(screen.getByText('Tasks (3)')).toBeInTheDocument();
    });

    // Check that priority labels appear in the rendered output
    expect(screen.getByText(/— high/)).toBeInTheDocument();
    expect(screen.getByText(/— medium/)).toBeInTheDocument();
    expect(screen.getByText(/— low/)).toBeInTheDocument();
  });

  // ---------------------------------------------------------------
  // TEST 5: ERROR STATE
  //
  // When the API call fails, the component should:
  //   - Stop showing the loading message
  //   - Display the error message
  //   - NOT display any task list
  //
  // We simulate failure with mockRejectedValue — the mock returns
  // a rejected promise, just like a real fetch() would when the
  // server returns 500.
  // ---------------------------------------------------------------

  it('displays error message when API call fails', async () => {
    mockedGetTasks.mockRejectedValue(new Error('Network error'));

    render(<TaskList />);

    // Wait for the error message to appear
    await waitFor(() => {
      const errorMessage = screen.getByRole('alert');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveTextContent('Error: Network error');
    });

    // Loading should be gone
    expect(screen.queryByRole('status')).not.toBeInTheDocument();

    // No task list should be rendered
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  // ---------------------------------------------------------------
  // TEST 6: EMPTY STATE
  //
  // When the API returns an empty array (no tasks exist),
  // the component should show a friendly empty message instead
  // of rendering an empty <ul>.
  // ---------------------------------------------------------------

  it('displays empty message when no tasks exist', async () => {
    mockedGetTasks.mockResolvedValue([]);

    render(<TaskList />);

    await waitFor(() => {
      expect(screen.getByText('No tasks found.')).toBeInTheDocument();
    });

    // No list rendered for empty state
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  // ---------------------------------------------------------------
  // TEST 7: API IS CALLED EXACTLY ONCE
  //
  // Verify that the component calls getTasks() exactly once on mount.
  // A common bug is calling the API in a useEffect without the
  // dependency array [], which causes infinite re-fetching.
  // This test catches that.
  // ---------------------------------------------------------------

  it('calls getTasks exactly once on mount', async () => {
    mockedGetTasks.mockResolvedValue(mockTasks);

    render(<TaskList />);

    await waitFor(() => {
      expect(screen.getByText('Tasks (3)')).toBeInTheDocument();
    });

    expect(mockedGetTasks).toHaveBeenCalledTimes(1);
  });

  // ---------------------------------------------------------------
  // TEST 8: SINGLE TASK
  //
  // Edge case: verify the component handles a list with just one
  // task correctly (heading shows count of 1, one list item).
  // ---------------------------------------------------------------

  it('handles a single task correctly', async () => {
    const singleTask: Task[] = [
      { id: '99', title: 'Solo task', completed: false, priority: 'medium' },
    ];
    mockedGetTasks.mockResolvedValue(singleTask);

    render(<TaskList />);

    await waitFor(() => {
      expect(screen.getByText('Tasks (1)')).toBeInTheDocument();
    });

    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    expect(screen.getByText('Solo task')).toBeInTheDocument();
  });
});
