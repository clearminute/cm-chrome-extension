import { state, setState } from './state.js';
import isBrowserFocused from './isBrowserFocused.js';
import isIdle from './isIdle.js';
import getHostname from './getHostname.js';
import debugLog from './debugLog.js';
import createDayIdentifier from './createDayIdentifier.js';
import { db } from './database/db.js';

const type = 'website';
const bundleId = 'com.google.Chrome';
const TICK_INTERVAL_SECONDS = 1;

function addActivityStackToBatch() {
  const { activityStack, batch } = state;

  if (activityStack.length === 0) {
    return;
  }

  const firstEntity = activityStack[0];
  const lastEntity = activityStack[activityStack.length - 1];

  const newBatch = [
    ...batch,
    {
      type,
      bundleId,
      title: getHostname(firstEntity.url),
      from: firstEntity.timestamp,
      until: lastEntity.timestamp
    }
  ];

  setState({
    batch: newBatch,
    activityStack: []
  });
}

function shouldStartNewActivity(lastActivity, tab, currTimestamp) {
  const isActivityDifferent = lastActivity.url !== tab.url;
  // The time between two activities is about TICK_INTERVAL_SECONDS * 1000ms under normal circumstances,
  // so more than TICK_INTERVAL_SECONDS * 1000 + 1000ms we assume  PC was asleep / idle
  const wasPCIdle = currTimestamp - lastActivity.timestamp > TICK_INTERVAL_SECONDS * 1000 + 1000;

  return isActivityDifferent || wasPCIdle;
}

function handleActivityStackChange() {
  const tab = state.currentTab;
  const currTimestamp = Date.now();
  const lastActivity = state.activityStack[state.activityStack.length - 1];

  if (lastActivity && shouldStartNewActivity(lastActivity, tab, currTimestamp)) {
    addActivityStackToBatch();
  }

  const activityStack = [...state.activityStack, { timestamp: currTimestamp, ...tab }];
  setState({ activityStack });
}

async function maybeHandleFocusTick() {
  if (!state.isInFocus) {
    return;
  }

  if (state.currentTab) {
    const transaction = db.transaction(['activities'], 'readwrite');
    const objectStore = transaction.objectStore('activities');
    const index = objectStore.index('title');
    const title = getHostname(state.currentTab.url);
    const savedActivitiy = await index.get(title);

    if (savedActivitiy.productivityKey === 'distracting') {
      chrome.tabs.update({ url: 'https://www.clearminute.com/stop.html' });
    }
  }

  const dayIdentifier = createDayIdentifier(new Date());

  // a new day (23:59 - 00:00);
  if (!state.focusSessions[dayIdentifier]) {
    state.focusSessions[dayIdentifier] = { seconds: 0 };
  }
  state.focusSessions[dayIdentifier].seconds++;
}

export default function handleTick() {
  debugLog('handle tick', state);

  if (isIdle()) {
    return;
  }

  maybeHandleFocusTick();

  if (!state.currentTab) {
    return;
  }

  if (!isBrowserFocused(state.currentWindowId)) {
    return;
  }

  handleActivityStackChange();
}
