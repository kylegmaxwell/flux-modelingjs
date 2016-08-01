/** @file Helper module for typechecking modelingjs functions against
 * json-schema type descriptions.
/* jslint node:true */
"use strict";

var flux = require("./index.js");

/** Parses a (subset of) jspaths into components.
 *  @param {string}     path
 *  @return {Array.<string>}  components
*/
function parsePath(s) {
    if(s[0] !== "#") {
        throw "Expected paths similar to #/foo/bar/baz";
    }
    s = s.substr(2);
    return s.split("/");
}

/** From a path, retrieve the equivalent subschema from the pbw schema.
 *  @param {string}     path
 *  @return {object}    subschema
*/
function getSubSchema(refPath) {
    var components = parsePath(refPath);
    var s = flux.schemas.pbw;
    for (var i = 0; i < components.length; i++) {
        var sub = s[components[i]];
        s = sub;
    }
    return s;
}

/** Given a path inside of the pbw schema, walks the schema to determine that
 * path's dimension, if it has one.
 *  @param {string}  subSchema - path to subschema inside pbw schema
 *  @return {string} dimension - dimension for path, or undefined if dimensionless
*/
function recurseToDimension(subSchema) {
    if (subSchema === undefined) {
        return undefined;
    }
    if (subSchema.$ref !== undefined) {
        return recurseToDimension(getSubSchema(subSchema.$ref));
    }
    if (subSchema.oneOf !== undefined) {
        return recurseToDimension(subSchema.oneOf[0]);
    }
    switch(subSchema.type) {
        // As our units-of-measurement schema does not index into arrays,
        // assume that all items in each array have the same dimension.
        case "array":
            return recurseToDimension(subSchema.items);
        case "number":
            return subSchema.fluxDimension;
        // We swallow any sub-objects that might ahve further
        // case "object":
    }
    return undefined;
}

/** Looks up field to dimension mapping for entity types.
 * This is a very limited implementation that only supports units scoped a
 * single-field deep, and does not support indexing into composite entities
 * (eg, polycurve and polysurface). It does work for the existing set of
 * entities as described in psworker.json, but extensions to that may require
 * revisiting this implementation.
 *
 *  @param  {string}    typeid  - name of entity type, value for 'primitive' property
 *  @return {object}            - map from field to dimension
 */
function lookupFieldDimensions(typeid) {
    var schema = flux.schemas.pbw;
    var subSchema = schema.entities[typeid];

    var results = {};
    for (var key in subSchema.properties) {
        var d = recurseToDimension(subSchema.properties[key]);
        if (d !== undefined) {
            results[key] = d;
        }
    }
    return results;
}


// TODO(andrew): consider setting these at a per-project level, rather than
// hardcoding them.
var _defaultDimToUnits = {
    "length":"meters",
    "area":"meters*meters",
    "volume":"meters*meters*meters",
    "angle":"degrees"
};


/** Looks up default field units
 *
 *  @param  {string}    typeid  - name of entity type, value for 'primitive' property
 *  @return {object}            - map from field to unit, appropriate for setting
 *                                as the "units" field of an entity.
 */
function defaultUnits(typeid) {
    var dimensions = lookupFieldDimensions(typeid);
    var results;
    for (var key in dimensions) {
        if (results === undefined) {
            results = {};
        }
        results[key] = _defaultDimToUnits[dimensions[key]];
    }
    return results;
}

/** Determines whether or not an entity has units information attached
 *
 *  @param  {object}    entity  - name of entity type, value for 'primitive' property
 *  @return {object}            - map from field to unit, appropriate for setting
 *                                as the "units" field of an entity.
 */
function detectUnits(entity) {
    // If units are defined, return true
    if (entity.units) {
        return true;
    }

    // Brep entities have implicit units.
    if (entity.primitive === "brep") {
        return true;
    }

    // For polycurve and polysurface entities, loop through subentities;
    if (entity.primitive === "polycurve") {
        for (var i = 0; i < entity.curves.length; i++) {
            if (detectUnits(entity.curves[i])) {
                return true;
            }
        }
    }
    if (entity.primitive === "polysurface") {
        for (var j = 0; j < entity.surfaces.length; j++) {
            if (detectUnits(entity.surfaces[j])) {
                return true;
            }
        }
    }

    return false;
}

module.exports = function() {
    // I'm submitting this as a series of cl's. Followup cl's populate more
    // methods into this file.
    return {
        measure: {
            detectUnits: detectUnits,
            defaultUnits: defaultUnits,
            lookupFieldDimensions: lookupFieldDimensions,
            // TODO(andrew): don't export this symbol; it's messy, and we want
            // to pass it in per-project, rather than having a single global.
            _defaultDimToUnits: _defaultDimToUnits
        }
    }
}
