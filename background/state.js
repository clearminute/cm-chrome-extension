let state = {
  activityStack: [],
  batch: [],
  currentWindowId: chrome.windows.WINDOW_ID_NONE,
  idleStatus: 'active',
  currentHostname: '',
  activities: [],
  isInFocus: false,
  focusSessions: {}, // seconds for each day in focus
  focusSessionId: undefined, // sessionId, unique within a day, but not day-wide
  productivity: 0,
  tracking: true
};

function setState(newState) {
  state = {
    ...state,
    ...newState
  };
}

export { setState, state };
