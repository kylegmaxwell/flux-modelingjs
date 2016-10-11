/**
 * Custom message class for geometry related errors and statuses.
 */
'use strict';

export default function StatusMap() {
    // Container for all errors
    // Map from string to list of strings
    this.errors = {};
}

// Static variable to initialize key with no error
StatusMap.NO_ERROR = '';

/**
 * Clear / initialize all temporary arrays
 */
StatusMap.prototype.clear = function () {
    this.errors = {};
};

/**
 * Add a new error to the map.
 * If the error is StatusMap.NO_ERROR the entry will be added, but the list will
 * be empty, which allows the user to get a list of valid keys if needed.
 * @param {String} key The name of the error
 * @param {String} newError The error message
 */
StatusMap.prototype.appendError = function (key, newError) {
    // Make sure the entry exists
    this.appendValid(key);
    // Add the error if it exists and is not a duplicate
    if (newError && this.errors[key].indexOf(newError) === -1) {
        this.errors[key].push(newError);
    }
};

/**
 * Add a key to indicate that an item was processed with no errors
 * @param  {String} key The item to store
 */
StatusMap.prototype.appendValid = function (key) {
    // Make sure the entry exists so we can track what keys are valid
    if (!this.errors[key]) {
        this.errors[key] = [];
    }
};

/**
 * Determine if key is valid
 * @param {String} key Where to look in the map
 * @returns {boolean} True if the key is valid, meaning no errors
 */
StatusMap.prototype.validKey = function (key) {
    return !this.errors[key] || this.errors[key].length === 0;
};

/**
 * Determine if the key is invalid
 * @param {String} key The entry to look for
 * @returns {boolean} True if the key is NOT valid, meaning has an error
 */
StatusMap.prototype.invalidKey = function (key) {
    return !this.validKey(key);
};

/**
 * Create a human readable summary of all the errors.
 * @returns {string} The summary
 */
StatusMap.prototype.invalidKeySummary = function () {
    var _this = this;
    var errors = Object.keys(this.errors).reduce(function (prev, key) {
        if (_this.invalidKey(key)) {
            prev.push(key+' ('+_this.errors[key].join(', ')+')');
        }
        return prev;
    },[]);
    return errors.join(', ');
};

/**
 * Merge the errors in this map with that of another
 * @param  {StatusMap} other The other one
 */
StatusMap.prototype.merge = function (other) {
    for (var key in other.errors) {
        if (this.errors[key] && this.errors[key].constructor === Array) {
            this.errors[key].concat(other.errors[key]);
        } else {
            this.errors[key] = other.errors[key];
        }
    }
};
