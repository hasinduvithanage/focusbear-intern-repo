// ---------------------------------------------------------------
// FOCUS TASK COMPONENT — TEST SUITE
//
// Tests are grouped by what they verify:
//   1. Rendering — does the component display the right content?
//   2. User interaction — do clicks change what the user sees?
//   3. State transitions — does the UI flow through states correctly?
//   4. Callback props — does the component notify the parent correctly?
//
// NO MOCKING NEEDED here — this component has no API calls.
// We're testing pure UI behaviour: render, click, check.
// ---------------------------------------------------------------

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { FocusTask } from '../src/FocusTask';

// =================================================================
// 1. RENDERING TESTS — Does It Display Correctly?
// =================================================================

describe('FocusTask rendering', () => {
  // ---------------------------------------------------------------
  // The simplest possible test: render and check text appears.
  // This verifies the component doesn't crash and shows the
  // task name passed via props.
  // ---------------------------------------------------------------

  it('displays the task name as a heading', () => {
    render(<FocusTask taskName="Learn React Testing" />);

    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveTextContent('Learn React Testing');
  });

  // ---------------------------------------------------------------
  // Check the initial status message — user hasn't clicked anything
  // yet, so they should see the "ready to focus" prompt.
  // ---------------------------------------------------------------

  it('shows the idle message initially', () => {
    render(<FocusTask taskName="Study" />);

    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Ready to focus? Hit the button below.');
  });

  // ---------------------------------------------------------------
  // The Start Focusing button should be visible on first render.
  // The Stop Focusing button should NOT be visible yet.
  // ---------------------------------------------------------------

  it('shows Start Focusing button initially', () => {
    render(<FocusTask taskName="Study" />);

    expect(screen.getByRole('button', { name: 'Start Focusing' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Stop Focusing' })).not.toBeInTheDocument();
  });

  // ---------------------------------------------------------------
  // Mark Complete button should always be present in the active state.
  // ---------------------------------------------------------------

  it('shows Mark Complete button', () => {
    render(<FocusTask taskName="Study" />);

    expect(screen.getByRole('button', { name: 'Mark Complete' })).toBeInTheDocument();
  });

  // ---------------------------------------------------------------
  // Focus count should NOT appear until the user has started
  // at least one session. Tests that conditional rendering works.
  // ---------------------------------------------------------------

  it('does not show focus count before any sessions', () => {
    render(<FocusTask taskName="Study" />);

    expect(screen.queryByText(/Focus sessions:/)).not.toBeInTheDocument();
  });
});

// =================================================================
// 2. USER INTERACTION TESTS — Do Clicks Change the UI?
// =================================================================

describe('FocusTask user interactions', () => {
  // ---------------------------------------------------------------
  // CLICKING "Start Focusing"
  //
  // After clicking, the user should see:
  //   - Status changes to "Focus mode active"
  //   - Button changes from "Start" to "Stop"
  //   - Focus count appears showing 1
  //
  // userEvent.setup() creates a user instance that simulates
  // realistic browser events (mousedown, mouseup, click in sequence).
  // Every userEvent method is async, so we always await it.
  // ---------------------------------------------------------------

  it('switches to focus mode when Start Focusing is clicked', async () => {
    const user = userEvent.setup();
    render(<FocusTask taskName="Deep Work" />);

    // Click the Start button
    await user.click(screen.getByRole('button', { name: 'Start Focusing' }));

    // Status message should change
    expect(screen.getByRole('status')).toHaveTextContent(
      'Focus mode active — stay on track!'
    );

    // Button should now say "Stop Focusing"
    expect(screen.getByRole('button', { name: 'Stop Focusing' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Start Focusing' })).not.toBeInTheDocument();

    // Focus count should appear
    expect(screen.getByText('Focus sessions: 1')).toBeInTheDocument();
  });

  // ---------------------------------------------------------------
  // CLICKING "Stop Focusing"
  //
  // After stopping, the user should see:
  //   - Status reverts to "Ready to focus"
  //   - Button changes back to "Start"
  //   - Focus count remains visible (sessions don't reset)
  // ---------------------------------------------------------------

  it('returns to idle mode when Stop Focusing is clicked', async () => {
    const user = userEvent.setup();
    render(<FocusTask taskName="Deep Work" />);

    // Start then stop
    await user.click(screen.getByRole('button', { name: 'Start Focusing' }));
    await user.click(screen.getByRole('button', { name: 'Stop Focusing' }));

    // Status reverts to idle
    expect(screen.getByRole('status')).toHaveTextContent(
      'Ready to focus? Hit the button below.'
    );

    // Button reverts to "Start"
    expect(screen.getByRole('button', { name: 'Start Focusing' })).toBeInTheDocument();

    // Count is still visible (doesn't disappear after stopping)
    expect(screen.getByText('Focus sessions: 1')).toBeInTheDocument();
  });

  // ---------------------------------------------------------------
  // MULTIPLE FOCUS SESSIONS
  //
  // Start → Stop → Start → Stop should increment the counter to 2.
  // This verifies the count tracks cumulative sessions, not just
  // the current one.
  // ---------------------------------------------------------------

  it('increments focus count across multiple sessions', async () => {
    const user = userEvent.setup();
    render(<FocusTask taskName="Practice" />);

    // Session 1
    await user.click(screen.getByRole('button', { name: 'Start Focusing' }));
    await user.click(screen.getByRole('button', { name: 'Stop Focusing' }));

    // Session 2
    await user.click(screen.getByRole('button', { name: 'Start Focusing' }));
    await user.click(screen.getByRole('button', { name: 'Stop Focusing' }));

    expect(screen.getByText('Focus sessions: 2')).toBeInTheDocument();
  });

  // ---------------------------------------------------------------
  // MARKING COMPLETE
  //
  // Clicking "Mark Complete" should transition to the completed
  // view — a completely different UI showing a success message.
  // ---------------------------------------------------------------

  it('shows completion message when Mark Complete is clicked', async () => {
    const user = userEvent.setup();
    render(<FocusTask taskName="Write Tests" />);

    await user.click(screen.getByRole('button', { name: 'Mark Complete' }));

    // Heading changes
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Task Complete');

    // Success message with task name
    expect(screen.getByRole('status')).toHaveTextContent(
      'Great job! You finished: Write Tests'
    );

    // Both buttons should be gone (completed state has no buttons)
    expect(screen.queryByRole('button', { name: 'Start Focusing' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Mark Complete' })).not.toBeInTheDocument();
  });

  // ---------------------------------------------------------------
  // COMPLETE AFTER FOCUSING
  //
  // If the user does 2 focus sessions then completes, the completed
  // view should show the correct total focus count.
  // ---------------------------------------------------------------

  it('shows correct focus count in completion message after sessions', async () => {
    const user = userEvent.setup();
    render(<FocusTask taskName="Read Docs" />);

    // Two focus sessions
    await user.click(screen.getByRole('button', { name: 'Start Focusing' }));
    await user.click(screen.getByRole('button', { name: 'Stop Focusing' }));
    await user.click(screen.getByRole('button', { name: 'Start Focusing' }));
    await user.click(screen.getByRole('button', { name: 'Stop Focusing' }));

    // Complete the task
    await user.click(screen.getByRole('button', { name: 'Mark Complete' }));

    expect(screen.getByText('Total focus sessions: 2')).toBeInTheDocument();
  });
});

// =================================================================
// 3. CALLBACK PROP TESTS — Does It Notify the Parent?
// =================================================================

describe('FocusTask callback props', () => {
  // ---------------------------------------------------------------
  // When the user clicks "Mark Complete", the component should
  // call the onComplete callback with the task name.
  //
  // We pass jest.fn() as the callback, then check it was called
  // with the right argument. This is how you test child-to-parent
  // communication without rendering the parent.
  // ---------------------------------------------------------------

  it('calls onComplete with the task name when completed', async () => {
    const user = userEvent.setup();
    const handleComplete = jest.fn();

    render(<FocusTask taskName="Ship Feature" onComplete={handleComplete} />);

    await user.click(screen.getByRole('button', { name: 'Mark Complete' }));

    expect(handleComplete).toHaveBeenCalledWith('Ship Feature');
    expect(handleComplete).toHaveBeenCalledTimes(1);
  });

  // ---------------------------------------------------------------
  // If no onComplete prop is provided, the component should still
  // work without crashing. This tests defensive coding — the
  // optional callback (onComplete?) should be safe to omit.
  // ---------------------------------------------------------------

  it('works without onComplete callback (optional prop)', async () => {
    const user = userEvent.setup();

    // No onComplete prop passed — should not crash
    render(<FocusTask taskName="Solo Task" />);

    await user.click(screen.getByRole('button', { name: 'Mark Complete' }));

    // Component still transitions to completed state normally
    expect(screen.getByRole('status')).toHaveTextContent(
      'Great job! You finished: Solo Task'
    );
  });
});
