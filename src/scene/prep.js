/**
 * Class to clean up entities before conversion.
 */
'use strict';

import convertUnits from './units/unitConverter.js';
import colorToArray from './materials.js';
import * as constants from './constants.js';
import * as revitUtils from './revitUtils.js';
import * as schema from './schemaValidator.js';
import * as utils from './utils.js';

/**
 * Modify an object and then return a copy of it with no null properties
 * @param  {Object} obj JSON data
 * @param  {Boolean} alreadyChanged Tells whether there was a previous change that requires a clone
 * @return {Object}     Updated JSON data
 */
function _removeNulls(obj, alreadyChanged) {
    if (!obj) return obj;
    var changed = _unsetNulls(obj);
    if (changed || alreadyChanged) {
        return JSON.parse(JSON.stringify(obj));
    } else {
        return obj;
    }
}

/**
 * Replace all properties on an object or its children that are null with undefined
 * @param  {Object} obj JSON object data
 * @return  {Boolean} obj Whether any values were changed by setting to null
 */
function _unsetNulls(obj) {
    var changed = false;
    // Collapse array
    if (obj.constructor === Array) {
        var arr = [];
        var i;
        for (i=0;i<obj.length;i++) {
            if (obj[i]!=null) arr.push(obj[i]);
        }
        obj.length = arr.length;
        for (i=0;i<obj.length;i++) {
            obj[i] = arr[i];
        }
    }
    // Unset nulls
    for (var key in obj) {
        if (obj[key] === null) {
            obj[key] = undefined;
            changed = true;
        } else if (obj[key] && typeof obj[key] === 'object') {
            if (_unsetNulls(obj[key])) {
                changed = true;
            }
        }
    }
    return changed;
}


/**
 * Make sure that there are not white layers, as this makes it hard to see lines
 * TODO(Kyle): This is a hacky workaround for GI-4404 / LIB3D-1002
 * @param  {Array} entities Array of Flux JSON primitives
 * @return {Boolean} Whether any changes were made
 */
function _cleanLayerColors(entities) {
    var changed = false;
    for (var i=0;i<entities.length;i++) {
        var entity = entities[i];
        if (!entity || !entity.primitive) continue;
        if (entity.primitive === constants.SCENE_PRIMITIVES.layer) {
            if (JSON.stringify(entity.color)==="[1,1,1]") {
                entity.color = undefined;
                changed = true;
            }
        }
    }
    return changed;
}

/**
 * Convert all units to meters
 * @param  {Object} obj JSON object to modify
 * @param  {StatusMap} primStatus Container for errors
 */
function _convertUnits(obj, primStatus) {
    if (obj != null && typeof obj === 'object') {
        if (obj.primitive) {
            // Handle units set on the container
            try {
                convertUnits(obj);
            } // Turn exceptions from invalid units into status messages
            catch(err) {
                primStatus.appendError(obj.primitive, err.message);
            }
            // Handle units on the children
            if (obj.primitive === 'polycurve') {
                _convertUnits(obj.curves, primStatus);
            } else if (obj.primitive === 'polysurface') {
                _convertUnits(obj.surfaces, primStatus);
            } else if (obj.primitive === 'revitElement') {
                _convertUnits(revitUtils.extractGeom(obj), primStatus);
            }
        } else {
            for (var key in obj) {
                _convertUnits(obj[key], primStatus);
            }
        }
    }
}

/**
 * Convert color strings to arrays
 * @param  {Object} obj Flux JSON data to be modified
 */
function _convertColors(obj) {
    if (obj != null && typeof obj === 'object') {
        for (var key in obj) {
            var value = obj[key];
            if (key === 'color' && typeof obj[key] === 'string') {
                obj[key] = colorToArray(value);
            } else {
                _convertColors(value);
            }
        }
    }
}

/**
 * Check whether the materialProperties objects are valid
 * Replaces invalid material properties with empty ones
 * @param  {Object} obj        Flux JSON object to check and modify
 * @param  {StatusMap} primStatus Container for error messages
 * @param  {Boolean} changed Dirty flag to mark if any materials are changed
 * @returns {Boolean} Dirty flag marking whether any materials were changed
 */
function _checkMaterials(obj, primStatus, changed) {
    var isChanged = changed;
    var props = constants.LEGACY_INVERSE_PROPERTIES;
    if (obj != null && typeof obj === 'object') {
        for (var key in obj) {
            var value = obj[key];
            if (key === 'materialProperties') {
                for (var p in value) {
                    if (p in props) {
                        value[props[p]] = 1.0 - value[p];
                        value[p] = undefined;
                        isChanged = true;
                    }
                }
                if (!schema.checkMaterial(value, primStatus)) {
                    obj[key] = {};
                }
            } else if (typeof value === 'object'){
                isChanged = _checkMaterials(value, primStatus, isChanged);
            }
        }
    }
    return isChanged;
}

/**
 * Flatten a nested array into a simple list
 * This function is recursive.
 * @param  {Array} arr    Source data
 * @param  {Array} result Empty array to store elements
 * @return {Array}        Return the result again for convenience
 */
function _flattenArray(arr, result) {
    if (arr == null) return result;

    if (arr.constructor === Array) {
        for (var i=0;i<arr.length;i++) {
            _flattenArray(arr[i], result);
        }
    } else {
        result.push(arr);
    }
    return result;
}

// TODO(Kyle) Move these constructors to modelingjs for LIB3D-778

/**
 * Create a group primitive
 * @param  {String} id                  Unique id
 * @param  {Array.<String>} children    Array of ids
 * @return {Object}                     Group JSON
 */
function createGroup(id, children) {
    return {
        primitive: constants.SCENE_PRIMITIVES.group,
        id: id,
        children: children
    };
}


/**
 * Create an instance primitive
 * @param  {String} id      Unique identifier
 * @param  {String} child   Id of child object
 * @return {Object}         Flux JSON for instance
 */
function createInstance(id, child) {
    return {
        primitive: constants.SCENE_PRIMITIVES.instance,
        id: id,
        entity: child
    };
}


/**
 * Replace a container element in the scene with a group
 * @param  {Array} scene       Array of Flux JSON
 * @param  {Object} element     Container element to be replaced
 * @param  {Array} children     Array of child entities
 * @return {Object}             New group JSON
 */
function _replaceElementScene(scene, element, children) {
        var ids = [];
        for (var c=0;c<children.length;c++) {
            var child = children[c];
            // Assign an id to the child (previously could not be referenced)
            child.id = element.id+'-child-'+c;
            var instance = createInstance(element.id+'-instance-'+c, child.id);
            scene.push(child);
            scene.push(instance);
            ids.push(instance.id);
        }
        var group = createGroup(element.id, ids);
        return group;
}

/**
 * Flatten a container element and use its children instead
 * @param  {Array} entities Array of Flux JSON
 * @param  {Object} element     Container element to be replaced
 * @param  {Array} children     Array of child entities
 * @param  {StatusMap} primStatus Map to track errors per primitive
 */
function _replaceElement(entities, element, children, primStatus) {
    _convertUnits(element, primStatus);
    for (var c=0;c<children.length;c++) {
        var child = children[c];
        if (element.attributes) {
            child.attributes = element.attributes;
        }
        entities.push(child);
    }
}
/**
 * Get rid of container entities and replace them with equivalent content.
 * @param  {Object} entities Array of Flux JSON
 * @param  {StatusMap} primStatus Map to track errors per primitive
 */
function _flattenElements(entities, primStatus) {
    var i;
    var isScene = utils.isScene(entities);
    var convertedIds = [];
    for (i=0;i<entities.length;i++) {
        var entity = entities[i];
        if (!entity || !entity.primitive) continue;
        if (constants.CONTAINER_PRIMS.indexOf(entity.primitive) !== -1 ) {
            var children = entity[constants.CONTAINER_PRIM_MAP[entity.primitive]];
            // if the entity has an id and this is a scene then replace it with a group
            if (entity.id && isScene) {
                entities[i] = _replaceElementScene(entities, entity, children);
                convertedIds.push(entity.id);
            } else {
                // otherwise just move the entities out and transfer attributes
                entities[i] = null;
                _replaceElement(entities, entity, children, primStatus);
            }
        }
    }
    // Convert parent instances to groups since instances can not point to groups
    for (i=0;i<entities.length;i++) {
        entity = entities[i];
        if (!entity || !entity.primitive) continue;
        if (entity.primitive === constants.SCENE_PRIMITIVES.instance && entity.entity && convertedIds.indexOf(entity.entity) !== -1) {
            entity.primitive = constants.SCENE_PRIMITIVES.group;
            entity.children = [entity.entity];
        }
    }
}

/**
 * Remove all revit data, and just keep render geometry
 * @param  {Array} entities Array of Flux JSON
 */
function _explodeRevit(entities) {
    var convertedIds = [];
    var isScene = utils.isScene(entities);
    for (var i=0;i<entities.length;i++) {
        var entity = entities[i];
        if (!entity || !entity.primitive) continue;
        if (entity.primitive === 'revitElement') {
            if (entity.id && isScene) {
                var children = revitUtils.extractGeom(entity);
                entities[i] = _replaceElementScene(entities, entity, children);
                convertedIds.push(entity.id);
            } else {
                entities[i] = null;
                var geoms = revitUtils.extractGeom(entity);
                for (var j=0;j<geoms.length;j++) {
                    entities.push(geoms[j]);
                }
            }
        }
    }
    // Convert parent instances to groups since instances can not point to groups
    for (i=0;i<entities.length;i++) {
        entity = entities[i];
        if (!entity || !entity.primitive) continue;
        if (entity.primitive === constants.SCENE_PRIMITIVES.instance && entity.entity && convertedIds.indexOf(entity.entity) !== -1) {
            entity.primitive = constants.SCENE_PRIMITIVES.group;
            entity.children = [entity.entity];
        }
    }
}

/**
 * Clone an element and transform it into a valid scene for rendering.
 * This removes all the troublesome corner cases that would complicate downstream processing.
 * @param  {Object} entity JSON element data
 * @param  {StatusMap} primStatus Map to track errors per primitive
 * @return {Object}        New JSON object representation
 */
export default function prep(entity, primStatus) {
    // Create a clone so that we can modify the properties in place
    // TODO(Kyle) This is slow for very large objects. The only reason we need a clone is for
    // the functions removeNulls and unitConverter, if we change those functions to return a new
    // data structure without modifying the result then this clone will not be necessary.
    var entityClone = JSON.parse(JSON.stringify(entity));

    // Guarantee that the data is an array and it is flat
    entityClone = _flattenArray([entity], []);

    var changed = _cleanLayerColors(entityClone);

    _explodeRevit(entityClone);

    _flattenElements(entityClone, primStatus);

    _convertColors(entityClone);

    changed = _checkMaterials(entityClone, primStatus, changed);

    // Get rid of invalid properties commonly sent by plugins on elements
    // If they remain these properties will fail schema validation.
    entityClone = _removeNulls(entityClone, changed);

    if (schema.checkSchema(entityClone, primStatus)) {
        return null;
    }

    _convertUnits(entityClone, primStatus);

    return entityClone;
}