'use strict';

import * as types from './types.js';
import * as measure from './measure.js';
import * as print from './debugPrint.js';
import FluxModelingError from './FluxModelingError.js';
import * as utilities from './utilities.js';

var registry; // singleton
var convertUnits = (function () {
    if (!registry) {
        registry = new measure.Registry();
    }
    if (registry) {
        return registry.ConvertUnits.bind(registry);
    } else {
        print.warn('Unable to create a new registry');
        return function (obj) { return obj; };
    }
})();

/** Helper function to extract point coordinates
    @private
    @param  {String}   primitive Primitive type name
    @param  {String}   field     The attribute to modify
    @return {Function}           Function to convert units on an object
*/
function makeAdjustCoords(primitive, field) {
    return function coords(obj) {
        if (Array.isArray(obj))
            return obj;

        if (utilities.isEntity(obj)) {
            if (obj.units &&
                obj.units[field] != types._defaultDimToUnits.length) {
                obj = convertUnits(obj, types._defaultDimToUnits);
            }

            if (obj.primitive === primitive) {
                return obj[field];
            }
        }
        throw new FluxModelingError("expected array of numbers or " + primitive + " entity");
    };
}

export var coords = makeAdjustCoords("point", "point");

export function mapCoords(vec) {
    var out = [];
    for (var i = 0, e = vec.length; i < e; ++i)
        out.push(coords(vec[i]));
    return out;
}

/** Helper function to extract vector components

    @private
    @param  {any}   obj  - entity or array
    @param  {string} [dimToUnits] - optional, desired units of resulting
        vector. Only used if the input object is an entity, and if this module
        has been init'd with a units of measure registry.
    @return {Array}             Component array
*/

export var vecCoords = makeAdjustCoords("vector", "coords");
