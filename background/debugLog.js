import isProduction from './isProduction.js';

export default function debugLog() {
    if (!isProduction()) {
        var args = Array.prototype.slice.call(arguments);
        console.log.apply(console, args);
    }
}