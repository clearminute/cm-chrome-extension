/* global chrome */
export const extensionId_PROD = 'pcenfiemkfldlchmgcohjkfhppckocne';

export const isProduction = chrome.runtime.id === extensionId_PROD;
export const extensionId = chrome.runtime.id;
