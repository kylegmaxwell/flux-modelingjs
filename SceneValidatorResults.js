'use strict';

/**
 * Class to hold results of a validation query
 * @param {Boolean} result  True if the scene is valid
 * @param {String} message  Description of error when invalid
 */
function SceneValidatorResults(result, message) {
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
SceneValidatorResults.prototype.getResult = function() {
    return this._result;
}

/**
 * Expose message
 * @return {String} Description of errors for bad scenes.
 */
SceneValidatorResults.prototype.getMessage = function() {
    return this._message;
}

module.exports = SceneValidatorResults;
