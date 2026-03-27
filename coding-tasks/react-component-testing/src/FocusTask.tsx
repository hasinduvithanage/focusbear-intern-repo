// ---------------------------------------------------------------
// FOCUS TASK COMPONENT
//
// A simple interactive component that demonstrates:
//   1. Rendering a static message (via props)
//   2. Button click that changes displayed content
//   3. Toggling state on/off
//   4. Conditional rendering based on state
//   5. Callback props (notifying parent of events)
//
// This is a realistic Focus Bear UI element — a task card where
// the user can start/stop focusing and mark the task as complete.
// ---------------------------------------------------------------

import React, { useState } from 'react';

// ---------------------------------------------------------------
// PROPS INTERFACE
//
// The component accepts these from its parent:
//   - taskName: the title to display
//   - onComplete: callback fired when user clicks "Mark Complete"
//                 (optional — component works without it)
// ---------------------------------------------------------------
export interface FocusTaskProps {
  taskName: string;
  onComplete?: (taskName: string) => void;
}

export function FocusTask({ taskName, onComplete }: FocusTaskProps) {
  // ---------------------------------------------------------------
  // STATE
  //
  // isFocusing: whether the user is currently in a focus session
  // isCompleted: whether the task has been marked as done
  // focusCount: how many focus sessions the user has started
  // ---------------------------------------------------------------
  const [isFocusing, setIsFocusing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [focusCount, setFocusCount] = useState(0);

  // ---------------------------------------------------------------
  // HANDLERS
  // ---------------------------------------------------------------

  const handleStartFocus = () => {
    setIsFocusing(true);
    setFocusCount((prev) => prev + 1);
  };

  const handleStopFocus = () => {
    setIsFocusing(false);
  };

  const handleComplete = () => {
    setIsCompleted(true);
    setIsFocusing(false);
    // Notify the parent component if a callback was provided
    if (onComplete) {
      onComplete(taskName);
    }
  };

  // ---------------------------------------------------------------
  // RENDER — Completed State
  // ---------------------------------------------------------------
  if (isCompleted) {
    return (
      <div>
        <h2>Task Complete</h2>
        <p role="status">Great job! You finished: {taskName}</p>
        <p>Total focus sessions: {focusCount}</p>
      </div>
    );
  }

  // ---------------------------------------------------------------
  // RENDER — Active State (focusing or idle)
  // ---------------------------------------------------------------
  return (
    <div>
      <h2>{taskName}</h2>

      {/* Status message changes based on whether user is focusing */}
      <p role="status">
        {isFocusing
          ? 'Focus mode active — stay on track!'
          : 'Ready to focus? Hit the button below.'}
      </p>

      {/* Show focus count only after at least one session */}
      {focusCount > 0 && <p>Focus sessions: {focusCount}</p>}

      {/* Toggle between Start and Stop buttons */}
      {isFocusing ? (
        <button onClick={handleStopFocus}>Stop Focusing</button>
      ) : (
        <button onClick={handleStartFocus}>Start Focusing</button>
      )}

      {/* Complete button is always available */}
      <button onClick={handleComplete}>Mark Complete</button>
    </div>
  );
}
