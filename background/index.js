import { state, setState } from './state.js';
import persistBatch from './persistBatch.js';
import handleTick from './handleTick.js';
import handleDashboardMessage from './handleDashboardMessage.js';
import handlePopupMessage from './handlePopupMessage.js';
import debugLog from './debugLog.js';

async function start() {
  debugLog('start...');
  chrome.browserAction.setBadgeBackgroundColor({ color: 'black' });

  // If no user input generated within 120 seconds, idle
  chrome.idle.setDetectionInterval(120);
  chrome.idle.onStateChanged.addListener(state => setState({ idleStatus: state }));

  chrome.windows.onFocusChanged.addListener(currentWindowId => setState({ currentWindowId }));
  chrome.windows.getCurrent(null, window => setState({ currentWindowId: window.id }));

  chrome.runtime.onMessageExternal.addListener(handleDashboardMessage);
  chrome.runtime.onMessage.addListener(handlePopupMessage);

  setInterval(() => {
    chrome.tabs.query(
      {
        active: true,
        currentWindow: true
      },
      tabs => {
        if (tabs.length > 1) {
          throw new Error('Exceeded number of expected tabs');
        }
        setState({ currentTab: tabs[0] });

        handleTick();
      }
    );
  }, 1000);

  setInterval(async () => {
    debugLog('PERSIST BATCH');
    persistBatch();
  }, 10 * 1000);
}

start();
