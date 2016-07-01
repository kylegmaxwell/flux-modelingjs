'use strict';
// additional rules for validator
var SceneValidatorResults = require('./SceneValidatorResults.js');

/**
 * Class to manage calls to check if JSON matches the scene spec
 */
function SceneValidator() {
    // instances that are already used in assemblies
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
    for(var key in json.elements) {
        if (json.elements[key][field] === value) {
            return json.elements[key];
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
        ' has a primitive type ('+bannedPrimitives[searchRes]+') that is not allowed with its current parent.'
    }
    return null;
}

/**
 * Determine if the instance is used properly in the scene
 * @param  {Object} instance        Flux element JSON
 * @param  {Object} json            Full scene JSON
 * @return {SceneValidatorResults}  The results
 */
function _validateInstance(instance, json){
    var node = _findObjectByField('id', instance.entity, json);
    if (!node) return _invalidId(instance.node);
    if (!node.primitive) return _primitiveError();

    var result = _validateNode(node, instance.id, ['instance', 'assembly', 'layer']);
    if (result) {
        return _error(result);
    }

    return _ok();
}

/**
 * Determine if the assembly is used properly in the scene
 * @param  {Object} assembly        Flux element JSON
 * @param  {Object} json            Full scene JSON
 * @return {SceneValidatorResults}  The Results
 */
SceneValidator.prototype._validateAssembly = function(assembly, json){
    if (!assembly.children || assembly.children.constructor !== Array) {
        return _error('Assembly must have array of children');
    }

    for(var i = 0; i < assembly.children.length; ++i){
        var nodeID = assembly.children[i];
        var node = _findObjectByField('id', nodeID, json);
        if (!node) return _invalidId(nodeID);
        if (!node.primitive) return _primitiveError();

        var result = _validateNode(node, assembly.id, ['layer']);
        if (result) {
            return _error(result);
        }

        // check instances are referenced by only a single assembly
        if (node.primitive === 'instance') {
            if (this.usedInstanceIDs.indexOf(node.id) != -1) {
                return _error('Instance with id = ' + node.id + ' is referenced more than once');
            } else {
                this.usedInstanceIDs.push(node.id);
            }
        }
        else if (node.primitive != 'assembly') {
            var message = 'Assembly can only contain instances or assemblies: '
                + node.id + ' has primitive ' +node.primitive;
            return _error(message);
        }
    }

    return _ok();
};

/**
 * Create a message for an invalid id
 * @param  {String} id The id that was invalid
 * @return {SceneValidatorResults}    The results
 */
function _invalidId(id) {
    return _error('No element found with ID=' + id);
}

/**
 * Create an error message object
 * @param  {String} message         Description of the message
 * @return {SceneValidatorResults}  The results object
 */
function _error(message) {
    return new SceneValidatorResults(false, message);
}

/**
 * Create a results object that represents successful validation
 * @return {SceneValidatorResults}  The results object
 */
function _ok() {
    return new SceneValidatorResults(true);
}

/**
 * Error message for objects missing the primitive attribute
 * @return {SceneValidatorResults}  The results object
 */
function _primitiveError() {
    return _error('Element referenced by ID has no primitive attribute');
}

/**
 * Determine if the layer is used properly in the scene
 * @param  {Object} layer           Flux element JSON
 * @param  {Object} json            Full scene JSON
 * @return {SceneValidatorResults}  The results
 */
function _validateLayer(layer, json){
    for(var i = 0; i < layer.elements.length; ++i){
        var nodeKey = layer.elements[i];
        var node = _findObjectByField('id', nodeKey, json);
        if (!node) return _invalidId(nodeKey);
        if (!node.primitive) return _primitiveError();
        // Layers can contain any entity except scenes and layers
        var result = _validateNode(node, layer.id, ['scene', 'layer']);
        if (result) {
            return _error(result);
        }
    }
    return _ok();
}

/**
 * Check if an object is scene data
 * @param  {Object}  json The scene JSON
 * @return {Boolean}      True if it is a scene
 */
SceneValidator.isScene = function (json) {
    return json && json.primitive && json.primitive === 'scene' &&
            json.elements && json.elements.constructor === Array;
}

/**
 * Determine if some arbitrary json is a valid scene
 * @param  {Object} json JSON data of a potential scene
 * @return {SceneValidatorResults}      The result
 */
SceneValidator.prototype.validateJSON = function (json)
{
    var allIDs = [];

    if (!SceneValidator.isScene(json)) {
        return _error('The element is not a scene');
    }
    var layerCount = 0;
    for (var i=0;i<json.elements.length;i++){
        var obj = json.elements[i];

        // check for unique id
        if (allIDs.indexOf(obj.id) != -1) {
            return _error('The id ' + obj.id + ' is not unique');
        } else {
            allIDs.push(obj.id);
        }

        // check instance reference only valid entity
        if (obj.primitive === 'instance'){
            var res = _validateInstance(obj, json);
            if (!res.getResult()) {
                return res;
            }
        }

        // check assemblies reference only instances or other assemblies
        else if (obj.primitive === 'assembly'){
            var res = this._validateAssembly(obj, json);
            if (!res.getResult()) {
                return res;
            }
        }

        // check layer reference only assemblies and instances
        else if (obj.primitive === 'layer'){
            var res = _validateLayer(obj, json);
            if (!res.getResult()) {
                return res;
            }
            layerCount++;
        }
    }
    if (layerCount < 1) {
        return _error('Scene has no layers');
    }
    return _ok();
}

module.exports = SceneValidator;