/**
 * Class to convert varied primitives into the same units.
 */
'use strict';

import UnitRegistry from './unitRegistry.js';
import * as constants from '../constants.js';
// import FluxModelingError from '../../FluxModelingError.js';
import pointer from 'json-pointer';

var registry = UnitRegistry.newStandardRegistry();

/**
 * Convert an entity to standardized units.
 * Note: modifies input JSON object in place
 * @param {Object} entity Flux entity parameters object
 */
export default function convertUnits (entity) {
    if (!entity.units) {
        return;
    }
    var units = entity.units;
    // Iterate over each unit specification and set it on the object
    for (var unitString in units) {
        // json-pointer requires leading slash, but for us it's optional
        var unitPath = unitString;
        if (unitString[0]!=='/') {
            unitPath = '/'+unitString;
        }
        if (!pointer.has(entity, unitPath)) {
            // TODO(Kyle): This should be a warning
            // https://vannevar.atlassian.net/browse/LIB3D-709
            // throw new FluxModelingError('Invalid unit path ' + unitString);
        } else {
            var unitValue = pointer.get(entity, unitPath);
            if (unitValue == null) {
                // TODO(Kyle): This should be a warning
                // https://vannevar.atlassian.net/browse/LIB3D-709
                // throw new FluxModelingError('Invalid unit measure ' + unitString);
                continue;
            }
            var unitMeasure = units[unitString];
            var func = registry.unitConversionFunc(unitMeasure, constants.DEFAULT_UNITS);
            if (!func) {
                // TODO(Kyle): This should be a warning
                // https://vannevar.atlassian.net/browse/LIB3D-709
                // throw new FluxModelingError('Unknown units specified');
                continue;
            }
            pointer.set(entity, unitPath, func(unitValue));
            entity.units[unitString] = constants.DEFAULT_UNITS;
        }
    }
}
