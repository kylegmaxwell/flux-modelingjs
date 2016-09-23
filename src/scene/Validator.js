'use strict';

import ValidatorResults from './ValidatorResults.js';

/**
 * Class to manage calls to check if JSON matches the scene spec
 */
export default function Validator() {
    // instances that are already used in groups
    this.usedInstanceIDs = [];
}

/**
 * Find an object in a collection by one of it's properties.
 * TODO(Kyle): this is inefficient, and could be replaced by a two pass algorithm with a map
 * @param  {String} field Property name
 * @param  {String} value Expected value of property
 * @param  {Object} json  The collection object to search
 * @return {Object}       The object if it was foudn
 */
function _findObjectByField(field, value, json) {
    for(var key in json) {
        if (json[key] == null) continue;
        if (json[key][field] === value) {
            return json[key];
        }
    }
}

/**
 * checks node.id is not equal to parent.id
 * checks node.primitive is not in the list of banned primitives
 * @param  {Object} node                        Scene element JSON object
 * @param  {String} parentID                    ID of node's parent in scene
 * @param  {Array.<String>} bannedPrimitives    List of primitives that node should not match
 * @return {String}                             Error message or null
 */
function _validateNode(node, parentID, bannedPrimitives){
    if (node.id === parentID) {
        return 'Node ' + node.id +' has ID equal to parent ID';
    }
    var searchRes = bannedPrimitives.indexOf(node.primitive);
    if (searchRes !== -1) {
        return 'Node ' + node.id +
        ' has a primitive type ('+bannedPrimitives[searchRes]+') that is not allowed with its current parent.';
    }
    return null;
}

/**
 * Determine if the instance is used properly in the scene
 * @param  {Object} instance        Flux element JSON
 * @param  {Object} json            Full scene JSON
 * @return {ValidatorResults}  The results
 */
function _validateInstance(instance, json){
    var node = _findObjectByField('id', instance.entity, json);
    if (!node) return _invalidId(instance.entity);
    if (!node.primitive) return _primitiveError();

    var result = _validateNode(node, instance.id, ['instance', 'group', 'layer']);
    if (result) {
        return _error(result);
    }

    return _ok();
}

/**
 * Determine if the group is used properly in the scene
 * @param  {Object} group        Flux element JSON
 * @param  {Object} json            Full scene JSON
 * @return {ValidatorResults}  The Results
 */
Validator.prototype._validateGroup = function(group, json){
    if (!group.children || group.children.constructor !== Array) {
        return _error('Group must have array of children');
    }

    for(var i = 0; i < group.children.length; i++){
        var nodeID = group.children[i];
        var node = _findObjectByField('id', nodeID, json);
        if (!node) return _invalidId(nodeID);
        if (!node.primitive) return _primitiveError();

        var result = _validateNode(node, group.id, ['layer']);
        if (result) {
            return _error(result);
        }

        // check instances are referenced by only a single group
        if (node.primitive === 'instance') {
            if (this.usedInstanceIDs.indexOf(node.id) != -1) {
                return _error('Instance with id = ' + node.id + ' is referenced more than once');
            } else {
                this.usedInstanceIDs.push(node.id);
            }
        }
        else if (node.primitive != 'group') {
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
    return _error('No element found with ID=' + id);
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
 * @param  {Object} json            Full scene JSON
 * @return {ValidatorResults}  The results
 */
function _validateLayer(layer, json){
    for(var i = 0; i < layer.elements.length; i++){
        var nodeKey = layer.elements[i];
        var node = _findObjectByField('id', nodeKey, json);
        if (!node) return _invalidId(nodeKey);
        if (!node.primitive) return _primitiveError();
        // Layers can contain any entity except scenes and layers
        var result = _validateNode(node, layer.id, ['layer']);
        if (result) {
            return _error(result);
        }
    }
    return _ok();
}

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
Validator.isScene = function (json) {
    return _hasLayer(json);
};

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
 * Determine if some arbitrary json is a valid scene
 * Precondition: Parameter json is a flat array of data.
 * @param  {Object} json JSON data of a potential scene
 * @return {ValidatorResults}      The result
 */
Validator.prototype.validateJSON = function (json)
{
    var allIDs = [];

    if (!Validator.isScene(json)) {
        return _error('The element is not a scene');
    }

    var groups = {};
    var layerCount = 0;
    for (var i=0;i<json.length;i++){
        var obj = json[i];
        if (obj == null) continue;

        // check for unique id
        if (allIDs.indexOf(obj.id) != -1) {
            return _error('The id ' + obj.id + ' is not unique');
        } else {
            allIDs.push(obj.id);
        }

        var res;
        // check instance reference only valid entity
        if (obj.primitive === 'instance'){
            res = _validateInstance(obj, json);
            if (!res.getResult()) {
                return res;
            }
        }

        // check groups reference only instances or other groups
        else if (obj.primitive === 'group'){
            res = this._validateGroup(obj, json);
            if (!res.getResult()) {
                return res;
            }
            groups[obj.id] = obj;
        }

        // check layer reference only groups and instances
        else if (obj.primitive === 'layer'){
            res = _validateLayer(obj, json);
            if (!res.getResult()) {
                return res;
            }
            if (obj.visible == null || obj.visible) {
                layerCount++;
            }
        }
    }
    if (layerCount < 1) {
        return _error('Scene has no visible or valid layers');
    }
    if (!_isAcyclic(groups)) {
        return _error('Cycle found in groups');
    }
    return _ok();
};
