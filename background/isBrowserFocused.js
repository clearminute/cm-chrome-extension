import { state } from './state.js';

export default function isBrowserFocused() {
  return state.currentWindowId !== chrome.windows.WINDOW_ID_NONE;
}
