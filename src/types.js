/** @file Helper module for typechecking modelingjs functions against
 * json-schema type descriptions.
/* jslint node:true */
'use strict';

import Ajv from 'ajv';
import entitySchema from './schema/flux-entity.js';
var schemaPrefix = 'entity';

/**
 * Helper function for assembling a specification struct, encapsulating a
 * schema fragment and a textual description of the expected value.
 *
 * @param {Object} schema       JSON-schema
 * @param {String} description  description of expected value
 * @return {Object}             specification
 */
function specification(schema, description) {
    return {
        schema: schema,
        description: description
    };
}

export var helpers = {
    Null: specification({ "type": "null" }, "null"),
    String: specification({"type": "string"}, "a string"),
    Number: specification({"type": "number"}, "a number"),
    PositiveInteger: specification({
            "type":    "integer",
            "minimum": 0,
            "exclusiveMinimum": true
        }, "a positive integer"),

    /** Convenience method for constructing a specification based on an entity
     * sub-schema inside the parasolid worker geometry entity schema.
     *
     * @param {String} name  Name of the entity, e.g, 'point'
     * @return {Object}      Specification
     */
    Entity: function(name) {
        var prefix =  'entities';
        if (entitySchema.geometry[name]) {
            prefix = 'geometry';
        }
        return specification({ $ref: schemaPrefix+'#/'+prefix+'/' + name}, name + " entity");
    },

    /**
     * Convenience method for constructing a specification based on a type
     * subschema inside the parasolid worker geometry types schema.
     *
     * @param {String} name Name of the type, e.g, 'position'
     * @return {Object}     Specification
     */
    Type: function(name) {
        return specification({ $ref: schemaPrefix+'#/types/' + name}, name);
    },

    /**
     * Construct a specification that will be satisfied if any of the argument
     * specifications are satisfied.
     * @return {Object} spec specification
    */
    AnyOf:function() {
        var args = Array.prototype.slice.call(arguments);
        return specification({
            "anyOf": args.map(function(s){
                return s.schema;
            })
        }, args.map(function(s){
            return s.description;
        }).join(" or "));
    },

    /**
     * Construct a specification that will be satisfied if the argument
     * specifications is satisfied, or if the value is null/undefined.
     *
     * Note that our validation logic coerces values to be checked from
     * to null.
     *
     * @param {Object} sub contains schema
     * @return {Object} specificaiton
    */
    Maybe: function(sub) {
        return helpers.AnyOf(sub, helpers.Null);
    },

    /** Construct a specificaiton that will be satisified for an array of the
     * sub-schemas.
     * @param {Object} sub contains schema
     * @return {Object} specification
     */
    ArrayOf: function(sub) {
        return specification({
            "type": "array",
            "items": sub.schema
        },
        "array of "+sub.description+"(s)");
    }
};

/** Parses a (subset of) jspaths into components.
 *  @param {string}     s path
 *  @return {Array.<string>}  components
*/
function parsePath(s) {
    if(s[0] !== "#") {
        throw "Expected paths similar to #/foo/bar/baz";
    }
    s = s.substr(2);
    return s.split("/");
}

/** From a path, retrieve the equivalent subschema from the entity schema.
 *  @param {string}     refPath path
 *  @return {object}    subschema
*/
function getSubSchema(refPath) {
    var components = parsePath(refPath);
    var s = entitySchema;
    for (var i = 0; i < components.length; i++) {
        var sub = s[components[i]];
        s = sub;
    }
    return s;
}

/** Given a path inside of the entity schema, walks the schema to determine that
 * path's dimension, if it has one.
 *  @param {string}  subSchema path to subschema inside entity schema
 *  @return {string} dimension dimension for path, or undefined if dimensionless
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
 * entities as described in flux-entity.js, but extensions to that may require
 * revisiting this implementation.
 *
 *  @param  {string}    typeid  name of entity type, value for 'primitive' property
 *  @return {object}            map from field to dimension
 */
export function lookupFieldDimensions(typeid) {
    var schema = entitySchema;
    var subSchema = schema.geometry[typeid];
    if (!subSchema) {
        subSchema = schema.entities[typeid];
    }
    var results = {};
    for (var key in subSchema.properties) {
        var d = recurseToDimension(subSchema.properties[key]);
        if (d !== undefined) {
            results[key] = d;
        }
    }
    return results;
}

// TODO(andrew): don't export this symbol; it's messy, and we want
// to pass it in per-project, rather than having a single global.
export var _defaultDimToUnits = {
    "length":"meters",
    "area":"meters*meters",
    "volume":"meters*meters*meters",
    "angle":"degrees"
};


/** Looks up default field units
 *
 *  @param  {string}    typeid  name of entity type, value for 'primitive' property
 *  @return {object}            map from field to unit, appropriate for setting
 *                              as the "units" field of an entity.
 */
export function defaultUnits(typeid) {
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

var checkerCache = {};

var ajv = Ajv({ allErrors: true, jsonPointers: true });

ajv.addSchema(entitySchema, schemaPrefix);

// Takes a json-schema snippet and returns a function that will validate
// that it's input matches the given schema, returning null for valid objects,
// and a list of [dataPath, message] pairs when validation fails.
export function generateChecker(name, specification) {
    var key = name + ":" + JSON.stringify(specification);
    if (!(key in checkerCache)) {
        var validateFn = ajv.compile(specification.schema);

        checkerCache[key] = function (obj) {
            // Coerce undefined values to null. This is a little bit
            // unfortunate, but json-schema does not support undefined
            // values. For these type checks to support maybe values without
            // using '|| null' before calling validation functions, we
            // make this coercion.
            if(typeof obj === "undefined") {
                obj = null;
            }
            if (!validateFn(obj)) {
                // This returns only a message generated from the descriptions
                // of individual object specifications. ajv provides a lot
                // more detail. However, this detail is overwhelming when
                // presented in the context of the flow composer. If we find
                // use-cases for the full detail, we should expose
                // a light-weight wrapper over ajv's validator that returns
                // the full set of errors.
                return "'"+name+"'" + " should be " + specification.description;
            }
        };
    }
    return checkerCache[key];
}

// Check all expects ["Name", spec, value] args.
export function checkAll() {
    var cases = Array.prototype.slice.call(arguments);
    // Each of these may throw.
    // TODO(andrew): consider accumulating errors.
    return cases.map(function(spec) {
        return generateChecker(spec[0], spec[1]) (spec[2]);
    });
}

/**
 * checkAllAndThrow is a convenience wrapper around checkall, which wil
 * throw a SchemaError if any of the passed cases fail.
 *
 * @param {...Array.<Object>} Cases, as [Name, Specification, Value] tuples.
**/
export function checkAllAndThrow() {
    var cases = Array.prototype.slice.call(arguments);
    // TODO(andrew): consider accumulating errors.
    checkAll.apply(undefined, cases).map(
    function(result) {
        if(result) {
            throw new Error(result);
        }
    });
}
