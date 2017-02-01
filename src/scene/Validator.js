'use strict';

import ValidatorResults from './ValidatorResults.js';
import * as utils from './utils.js';
import * as constants from './constants.js';
import * as schema from '../schema/index.js';

var prims = constants.SCENE_PRIMITIVES;

/**
 * Class to manage calls to check if JSON matches the scene spec
 */
export default function Validator() {
    // instances that are already used in groups
    this._usedInstanceIDs = [];
    // Mapping from id to objects in the scene
    this._idMap = [];
}

/**
 * checks node.id is not equal to parent.id
 * checks node.primitive is in the list of allowed primitives
 * @param  {Object} node                        Scene element JSON object
 * @param  {String} parentID                    ID of node's parent in scene
 * @param  {Array.<String>} [allowedPrimitives] List of primitives that node must match
 * @return {String}                             Error message or null
 */
function _validateContainedNode(node, parentID, allowedPrimitives){
    if (node.id === parentID) {
        return 'Node ' + node.id +' has ID equal to parent ID';
    }
    var searchRes = allowedPrimitives.indexOf(node.primitive);
    if (searchRes === -1) {
        return 'Node ' + node.id +
        ' has a primitive type ('+node.primitive+') that is not allowed with its current parent.';
    }
    return null;
}

/**
 * Check if a parent references the right kind of child by id
 * @param  {Object} parent                          Flux JSON entity
 * @param  {String} prop                            Name of the property that is an id reference
 * @param  {Array.<String>} allowedChildEntities    List of valid entity names for the given parent
 * @return {SceneValidatorResults}                  Error message or undefined
 */
Validator.prototype._validateReference = function (parent, prop, allowedChildEntities) {
    var child = this._idMap[parent[prop]];
    if (!child) return _invalidId(parent[prop]);
    if (!child.primitive) return _primitiveError();
    var result = _validateContainedNode(child, parent.id, allowedChildEntities);
    if (result) {
        return _error(result);
    }
};

// singleton list of things that can be instanced
var entities = Object.keys(schema.entity.geometry).concat(prims.geometry);
entities.push(prims.texture);
entities.push(prims.camera);
entities.push(prims.light);

/**
 * Determine if the instance is used properly in the scene
 * @param  {Object} instance        Flux element JSON
 * @return {ValidatorResults}  The results
 */
Validator.prototype._validateInstance = function (instance) {
    var result = this._validateReference(instance, 'entity', entities);
    if (result) {
        return result;
    }

    if (instance.material) {
        result = this._validateReference(instance, 'material', [prims.material]);
        if (result) {
            return result;
        }
    }

    return _ok();
};

/**
 * Determine if the material is linked properly in the scene
 * @param  {Object} material        Flux element JSON
 * @return {ValidatorResults}  The results
 */
Validator.prototype._validateMaterial = function (material) {
    if (material.colorMap) {
        var result = this._validateReference(material, 'colorMap', [prims.instance, prims.texture]);
        if (result) {
            return result;
        }
    }
    return _ok();
};

/**
 * Determine if the group is used properly in the scene
 * @param  {Object} group        Flux element JSON
 * @param  {Object} json            Full scene JSON
 * @return {ValidatorResults}  The Results
 */
Validator.prototype._validateGroup = function(group){
    if (!group.children || group.children.constructor !== Array) {
        return _error('Group must have array of children');
    }

    for(var i = 0; i < group.children.length; i++){
        var nodeID = group.children[i];
        var node = this._idMap[nodeID];
        if (!node) return _invalidId(nodeID);
        if (!node.primitive) return _primitiveError();

        var result = _validateContainedNode(node, group.id, [prims.group, prims.instance]);
        if (result) {
            return _error(result);
        }

        // check instances are referenced by only a single group
        if (node.primitive === prims.instance) {
            if (this._usedInstanceIDs.indexOf(node.id) != -1) {
                return _error('Instance with id = ' + node.id + ' is referenced more than once');
            } else {
                this._usedInstanceIDs.push(node.id);
            }
        }
        else if (node.primitive != prims.group) {
            var message = 'Group can only contain instances or groups: '
                + node.id + ' has primitive ' +node.primitive;
            return _error(message);
        }
    }

    return _ok();
};

/**
 * Create a message for an invalid id
 * @param  {String} id The id that was invalid
 * @return {ValidatorResults}    The results
 */
function _invalidId(id) {
    return _error('No element found with id=' + id);
}

/**
 * Create an error message object
 * @param  {String} message         Description of the message
 * @return {ValidatorResults}  The results object
 */
function _error(message) {
    return new ValidatorResults(false, message);
}

/**
 * Create a results object that represents successful validation
 * @return {ValidatorResults}  The results object
 */
function _ok() {
    return new ValidatorResults(true);
}

/**
 * Error message for objects missing the primitive attribute
 * @return {ValidatorResults}  The results object
 */
function _primitiveError() {
    return _error('Element referenced by ID has no primitive attribute');
}

/**
 * Determine if the layer is used properly in the scene
 * @param  {Object} layer           Flux element JSON
 * @return {ValidatorResults}  The results
 */
Validator.prototype._validateLayer = function(layer) {
    for(var i = 0; i < layer.elements.length; i++){
        var nodeKey = layer.elements[i];
        var node = this._idMap[nodeKey];
        if (!node) return _invalidId(nodeKey);
        if (!node.primitive) return _primitiveError();
        // Layers can contain any entity except scenes and layers
        var result = _validateContainedNode(node, layer.id, [prims.group, prims.instance]);
        if (result) {
            return _error(result);
        }
    }
    return _ok();
};

/**
* Determine if a camera is valid.
* All required properties should already be validated by the
* schema validator. Here we only check only a perspective camera
* has a focalLength property.
* @param {Object} camera        Flux element JSON
* @return {ValidatorResults}  The results
*/
function _validateCamera(camera){
    if (camera.type === "orthographic" && camera.focalLength != null) {
        return _error("Orthographic camera cannot have focal length.");
    }
    return _ok();
}

/**
* Determine if a light is valid.
* All required properties should already be validated by the
* schema validator. Here we only check that only spot light
* has the coneAngle property.
* @param {Object} light        Flux element JSON
* @return {ValidatorResults}  The results
*/
function _validateLight(light){
    if (light.type !== "spot" && light.coneAngle != null) {
        return _error("Cone angle is valid only on spot light.");
    }
    return _ok();
}

/**
 * Enumeration to store group states
 * @type {Object}
 */
var STATES = {
    PROCESSING: 1,
    VALID: 2
};

/**
 * Determine whether the graph structure of groups has any cycles.
 * Cyclical links in groups can not be rendered and are invalid.
 * @param  {Object}  groups Map from id to group data
 * @return {Boolean}            True if there are no cycles and the groups are valid
 */
function _isAcyclic(groups) {
    var stack = [];
    var parent = {};
    var states = {};
    for (var a in groups) {
        stack.push(groups[a].id);
    }
    // Depth first search
    while (stack.length > 0) {
        var id = stack.pop();
        var group = groups[id];
        // Skip repeatedly processing nodes in chains that do not have cycles
        if (states[id]===STATES.VALID) {
            continue;
        } else if (states[id] === STATES.PROCESSING) {
            return false;
        } else {
            states[id] = STATES.PROCESSING;
        }
        var numChildren = 0;
        var i;
        for(i = 0; i < group.children.length; i++){
            var childId = group.children[i];
            // Only check children that are groups
            if (groups[childId] && states[childId] !== STATES.VALID) {
                stack.push(childId);
                parent[childId] = id;
                numChildren++;
            }
        }
        // Leaf node has no cycles
        if (numChildren === 0) {
            var validId = id;
            // Mark parents as valid as long as they are satisfied
            while (validId && states[validId]===STATES.PROCESSING) {
                // A node is satisfied when all of it's children have been processed
                var satisfied = true;
                var children = groups[validId].children;
                // Check if any of the children that are groups are not yet valid
                for(i = 0; i < children.length; i++){
                    if (groups[children[i]] && states[children[i]]!==STATES.VALID) {
                        satisfied = false;
                    }
                }
                if (satisfied) {
                    states[validId] = STATES.VALID;
                    validId = parent[validId];
                } else {
                    validId = null;
                }

            }
        }
    }
    return true;
}


/**
 * Create a map from id to scene JSON for fast lookup
 * @param  {Array} json Scene   JSON list
 * @return {ValidatorResults}   The result
 */
Validator.prototype.cacheIds = function (json) {
    for (var i=0;i<json.length;i++) {
        var obj = json[i];
        if (obj == null || typeof obj.id !== 'string') continue;
        // check for unique id
        if (this._idMap[obj.id] != null) {
            return _error('The id ' + obj.id + ' is not unique');
        } else {
            this._idMap[obj.id] = obj;
        }
    }
    return _ok();
};

/**
 * Determine if some arbitrary json is a valid scene
 * Precondition: Parameter json is a flat array of data.
 * @param  {Object} json JSON data of a potential scene
 * @return {ValidatorResults}      The result
 */
Validator.prototype.validateJSON = function (json)
{
    if (!utils.isScene(json)) {
        return _error('The element is not a scene');
    }

    var idsOk = this.cacheIds(json);
    if (!idsOk.getResult()) {
        return idsOk;
    }

    var groups = {};
    var layerCount = 0;
    for (var i=0;i<json.length;i++){
        var obj = json[i];
        if (obj == null) continue;

        var res;
        // check instance reference only valid entity
        if (obj.primitive === prims.instance){
            res = this._validateInstance(obj);
            if (!res.getResult()) {
                return res;
            }
        }

        // check groups reference only instances or other groups
        else if (obj.primitive === prims.group){
            res = this._validateGroup(obj);
            if (!res.getResult()) {
                return res;
            }
            groups[obj.id] = obj;
        }

        // check layer reference only groups and instances
        else if (obj.primitive === prims.layer){
            res = this._validateLayer(obj);
            if (!res.getResult()) {
                return res;
            }
            layerCount++;
        }

        // Check valid camera
        else if (obj.primitive === prims.camera){
            res = _validateCamera(obj);
            if (!res.getResult()) {
                return res;
            }
        }

        // Check valid light
        else if (obj.primitive === prims.light){
            res = _validateLight(obj);
            if (!res.getResult()) {
                return res;
            }
        }

        // check material reference only instance or texture
        if (obj.primitive === prims.material){
            res = this._validateMaterial(obj);
            if (!res.getResult()) {
                return res;
            }
        }
    }
    if (layerCount < 1) {
        return _error('Scene has no valid layers');
    }
    if (!_isAcyclic(groups)) {
        return _error('Cycle found in groups');
    }
    return _ok();
};
