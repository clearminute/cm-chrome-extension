import createDayIdentifier from './createDayIdentifier.js';
import { db } from './database/db.js';
import { state } from './state.js';
import { createStats } from './handleDashboardMessage.js';
import debugLog from './debugLog.js';

export async function getFocusTime(response, options = { from: new Date() }) {
  const focusIdentifierForDay = createDayIdentifier(options.from);
  const transaction = db.transaction(['focus'], 'readwrite');
  const objectStore = transaction.objectStore('focus');
  const index = objectStore.index('focusIdentifierForDay');
  let dailyFocus = await index.get(focusIdentifierForDay);
  let sum = 0;

  if (dailyFocus) {
    for (const session of dailyFocus.sessions) {
      // 29 min
      if (session.seconds > 29 * 60) {
        sum += session.seconds;
      }
    }
  }

  response({ value: sum });
}

function startFocusSession(response) {
  if (state.isInFocus) {
    response();
    return;
  }

  debugLog('starting focus..');
  state.isInFocus = true;
  state.focusSessionId = Date.now();
  const dayIdentifier = createDayIdentifier(new Date());
  state.focusSessions = {
    [dayIdentifier]: {
      seconds: 0
    }
  };
  response();
}

async function stopFocusSession(response) {
  debugLog('stopping focus...', state);
  const transaction = db.transaction(['focus'], 'readwrite');
  const objectStore = transaction.objectStore('focus');
  const index = objectStore.index('focusIdentifierForDay');
  for (const dayIdentifier in state.focusSessions) {
    let dailyFocusSessions = await index.get(dayIdentifier);

    if (!dailyFocusSessions) {
      dailyFocusSessions = {
        focusIdentifierForDay: dayIdentifier,
        sessions: []
      };
    }

    dailyFocusSessions.sessions.push({
      ...state.focusSessions[dayIdentifier],
      sessionId: state.focusSessionId
    });

    await objectStore.put(dailyFocusSessions);
  }

  await transaction.complete;

  state.isInFocus = false;
  state.focusSessions = {};
  state.focusSessionId = undefined;
}

function getView(response) {
  response({ value: state.isInFocus ? 'FOCUS_SESSION' : 'HOME' });
}

function getCurrentFocusSessionTime(response) {
  state.focusSessionId = Date.now();
  const dayIdentifier = createDayIdentifier(new Date());
  const seconds = state.focusSessions[dayIdentifier]
    ? state.focusSessions[dayIdentifier].seconds
    : 0;
  response({ value: seconds });
}

export default function handlePopupMessage(request, sender, sendResponse) {
  debugLog('Pop up message!', request.type);
  if (request.type === 'LOAD_STATS') {
    createStats(request.message, sendResponse);
  }

  if (request.type === 'GET_TODAY_FOCUS_TIME') {
    getFocusTime(sendResponse);
  }

  if (request.type === 'START_FOCUS_SESSION') {
    startFocusSession(sendResponse);
  }

  if (request.type === 'STOP_FOCUS_SESSION') {
    stopFocusSession(sendResponse);
  }

  if (request.type === 'GET_CURRENT_FOCUS_SESSION_TIME') {
    getCurrentFocusSessionTime(sendResponse);
  }

  if (request.type === 'GET_VIEW') {
    getView(sendResponse);
  }

  return true;
}
