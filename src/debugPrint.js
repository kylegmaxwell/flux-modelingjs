/**
 * Utilities to isolate console use
 */
'use strict';

var WARNING_LEVELS = {
    ALL: 5,
    LOG: 4,
    INFO: 3,
    WARN: 2,
    ERROR: 1,
    SILENT: 0
};
var WARNING_LEVEL = WARNING_LEVELS.INFO;

export function log(message) {
    if (WARNING_LEVEL >= WARNING_LEVELS.LOG) {
        console.log(message); // eslint-disable-line no-console
    }
}

export function warn(message) {
    if (WARNING_LEVEL >= WARNING_LEVELS.WARN) {
        console.warn(message); // eslint-disable-line no-console
    }
}

export function error(message) {
    if (WARNING_LEVEL >= WARNING_LEVELS.ERROR) {
        console.error(message); // eslint-disable-line no-console
    }
}
