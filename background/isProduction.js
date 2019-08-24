export default function isProduction() {
    const extensionId_PROD = 'pcenfiemkfldlchmgcohjkfhppckocne';
    return chrome.runtime.id === extensionId_PROD;
}