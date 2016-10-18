/**
 * Entry point for creating scenes.
 */
'use strict';

import Ajv from 'ajv/dist/ajv.min.js';
import * as schema from '../schema/index.js';
import * as constants from './constants.js';

var entitiesJson = schema.entity;
var materialsJson = schema.material;
var revitJson = schema.revit;

// Mapping from primitive names to schema validator functions
var ajvValidators = null;

// Cache schema compiler object
var ajvSchema = null;

var entityPrefix = "fluxEntity";
var materialPrefix = "fluxMaterial";
var revitPrefix = "fluxRevit";

/**
 * Check whether all primitives in a JSON object match their schema.
 * Removes entities that are invalid.
 * @param  {Object} obj        Flux JSON to check and modify
 * @param  {type} primStatus Container for error messages
 * @return {Boolean}            Returns true when the property needs to be removed
 */
export function checkSchema(obj, primStatus) {
    if (obj != null && typeof obj === 'object') {
        if (obj.primitive && typeof obj.primitive === 'string' && obj.primitive !== 'scene') {
            if (!checkEntity(obj, primStatus)) {
                return true;
            }
        } else {
            for (var key in obj) {
                if (checkSchema(obj[key], primStatus)) {
                    obj[key] = null;
                }
            }
        }
    }
}

/**
 * Check if the entities match the parasolid entity schema
 * @param {Array} entity Array of arrays or entities
 * @param {StatusMap} statusMap Container for errors
 * @returns {boolean} True if the schema checked out
 * @private
 */
export function checkEntity (entity, statusMap) {
    if (entity && entity.primitive) {
        if (constants.NON_STANDARD_ENTITIES.indexOf(entity.primitive) !== -1) {
            return true;
        }
        var validate = _findValidator(entity.primitive);
        // Warning this assumes validate is synchronous so that we can
        // call validate on a singleton, and read the results safely from it's properties
        if (!validate) {
            statusMap.appendError(_getDescriptor(entity),'Unknown primitive type.');
            return false;
        }
        if (!validate(entity)) {
            statusMap.appendError(_getDescriptor(entity), _serializeErrors(validate.errors));
            return false;
        }
        return true;
    } else {
        return false;
    }
}

/**
 * Determine if the material is valid
 * @param  {Object} entity    Material properties JSON
 * @param  {StatusMap} statusMap Error message collection
 * @return {Boolean}           True for valid
 */
export function checkMaterial (entity, statusMap) {
    var primitive = 'materialProperties';
    var validate = _materialValidator(primitive);
    if (!validate(entity)) {
        statusMap.appendError(primitive, _serializeErrors(validate.errors));
        return false;
    }
    return true;
}

/**
 * Descriptive label for primitive when reporting name in errors
 * @param  {Object} entity Flux JSON object
 * @return {String}        Description (primitive:id)
 */
function _getDescriptor(entity) {
    var descriptor = entity.primitive;
    if (entity.id) {
        descriptor += ':'+entity.id;
    }
    return descriptor;
}

/**
 * Create schema compiler object
 * @private
 */
function _initSchema() {
    if (!ajvSchema) {
        ajvSchema = Ajv({ allErrors: true });
        ajvSchema.addSchema(entitiesJson, entityPrefix);
        ajvSchema.addSchema(materialsJson, materialPrefix);
        ajvSchema.addSchema(revitJson, revitPrefix);
        ajvValidators = {};
    }
}

/**
 * Get the validator for materials
 * @param  {String} primitive The indentifier for this schema
 * @return {Function}           The valitator function
 */
function _materialValidator(primitive) {
    _initSchema();
    // Compile the schema if needed
    if (!ajvValidators[primitive]) {
        ajvValidators[primitive] = ajvSchema.compile({ $ref: materialPrefix+"#/"+primitive });
    }
    return ajvValidators[primitive];
}

/**
 * Get the validator for revit elements
 * @param  {String} primitive The identifier for this schema
 * @return {Function}           The validator function
 */
function _revitValidator(primitive) {
    // Compile the schema if needed
    if (!ajvValidators[primitive]) {
        ajvValidators[primitive] = ajvSchema.compile({ $ref: revitPrefix+"#/revitTypes/revitCommon" });
    }
    return ajvValidators[primitive];
}

/**
 * Compile the schema for the given primitive
 * @param {String} primitive The name of the primitive
 * @returns {Function} Ajv validator function
 * @private
 */
function _findValidator(primitive) {
    _initSchema();
    // Compile the schema for this primitive if needed
    if (!ajvValidators[primitive]) {
        if (primitive !== 'revitElement') {
            var schemaPrim = entitiesJson.geometry[primitive];
            var schemaId = "#/geometry/"+primitive;
            if (!schemaPrim) {
                schemaPrim = entitiesJson.scene[primitive];
                schemaId = "#/scene/"+primitive;//scene, instance ...
            }
            if (!schemaPrim) {
                return null;
            }
            ajvValidators[primitive] = ajvSchema.compile({ $ref: entityPrefix + schemaId });
        } else {
            ajvValidators[primitive] = _revitValidator(primitive);
        }
    }
    return ajvValidators[primitive];
}

/**
 * Turn ajv errors into strings of their messages
 * @param {Array} errors Ajv error objects
 * @returns {string} Error message
 * @private
 */
function _serializeErrors(errors) {
    var messages = [];
    for (var i=0; i<errors.length; i++) {
        var error = errors[i];
        var message = '';
        if (error.dataPath) {
            message += error.dataPath+': ';
        }
        message += error.message;
        if ( Object.keys(error.params).length > 0) {
            var param = error.params[Object.keys(error.params)[0]];
            if (message.toLowerCase().indexOf(param) === -1) {
                message += ' ['+error.params[Object.keys(error.params)[0]]+']';
            }
        }
        messages.push(message);
    }
    return messages.join(', ');
}
