'use strict';

/**
 * Class to hold results of a validation query
 * @param {Boolean} result  True if the scene is valid
 * @param {String} message  Description of error when invalid
 */
export default function ValidatorResults(result, message) {
    this._result = result;
    if (message) {
        this._message = message;
    } else {
        this._message = '';
    }
}

/**
 * Expose result
 * @return {Boolean} True for valid scenes
 */
ValidatorResults.prototype.getResult = function() {
    return this._result;
};

/**
 * Expose message
 * @return {String} Description of errors for bad scenes.
 */
ValidatorResults.prototype.getMessage = function() {
    return this._message;
};
