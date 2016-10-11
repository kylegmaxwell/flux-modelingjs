'use strict';

import * as schema from '../schema.js';
import * as constants from './constants.js';

/**
 * Recursively search nested arrays for layer objects
 * @param  {Array} arr  Source data
 * @return {Boolean}    Whether there was a layer present
 */
function _hasLayer(arr) {
    if (!arr || typeof arr !== 'object') {
        return false;
    }

    if (arr.constructor !== Array) {
        return arr.primitive && arr.primitive === 'layer';
    } else {
        for (var i=0;i<arr.length;i++) {
            if (_hasLayer(arr[i])) {
                return true;
            }
        }
    }
}

/**
 * Check if an object is scene data
 * @param  {Object}  json The scene JSON
 * @return {Boolean}      True if it is a scene
 */
export function isScene(json) {
    return _hasLayer(json);
}

/**
 * Helper function to run a callback on each entity in the nested array
 * @param {Array} arr Array of arrays or entities
 * @param {Function} cb Callbck function returning boolean
 * @returns {boolean} Reduced return value of the callback
 * @private
 */
function _recursiveReduce (arr, cb) {
    if (!arr) return false;
    var isValid = false;
    if (arr.primitive) {
        isValid = cb(arr);
    } else if (arr.constructor === Array) {
        isValid = arr.reduce(function(prev, curr) {
            return prev || _recursiveReduce(curr, cb);
        }, false);
    }
    return isValid;
}

/**
 * Cache to prevent repetitive munging of arrays.
 * Stores all the acceptable primitive types for geometry.
 * @type {Array.<String>}
 */
var _validPrimsList = null;

/**
 * Return a list of all the valid primitive strings
 * @return {Array.<String>} The list of primitives
 */
function _listValidPrims ( ) {
    if (_validPrimsList) return _validPrimsList;

    _validPrimsList =    constants.KNOWN_PRIMITIVES.concat(
        constants.NON_STANDARD_ENTITIES,
        Object.keys(schema.entity.geometry)
        // Don't need to check for scene elements because a scene must also
        // have geometry entities to be renderable
    );
    return _validPrimsList;
}

/**
* Helper function to check if a revit element has
* displayable (mesh) geometry
* from a revitElement object.
*
* @function hasGeometry
*
* @param { object } data The revitElement.
*
* @return { Boolean } True of element has geometry.
*/
export function _hasRevitGeometry (data) {
    return data && data.geometryParameters && data.geometryParameters.geometry;
}

// Singleton is computed from static schema and constants
var prims = _listValidPrims();

/**
 * Helper function to check if the given element which
 * can have displayable geomtry actually has displayable
 * geometry. This is to prevent the viewport from switching
 * to 3D view mode if the element does not have
 * displayable geometry.
 *
 * @function _hasGeometry
 *
 * @param {Object} data Individual element
 * @return {Boolean} Whether there is geometry
 * @private
*/
function _hasGeometry(data) {
    if (data.primitive === 'revitElement') {
        return _hasRevitGeometry(data);
    }

    return data && data.primitive && (prims.indexOf(data.primitive) !== -1);
}

/**
 * Determine if the given data contains flux geometry.
 *
 * It can contain geometry, or arrays of geometry.
 *
 * @param  {Object}  data Flux JSON formatted object.
 * @return {Boolean}      Whether the data is geometry.
 */
export function isGeometry (data) {
    return _recursiveReduce(data, _hasGeometry);
}
