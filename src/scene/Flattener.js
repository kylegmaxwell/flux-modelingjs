'use strict';

import SceneValidator from './Validator.js';
import * as utils from './utils.js';
import FluxModelingError from '../FluxModelingError.js';
import { mat4 } from 'gl-matrix';
import * as constants from './constants.js';
import StatusMap from './StatusMap.js';
import prep from './prep.js';

/**
* Class implementing flatten operation on a scene.
* Constructor should be called with a valid scene object.
* @param {object} sceneJson         Scene to be flattened.
*/
export default function Flattener(sceneJson) {
    this.sceneJson = sceneJson;
    this.scene = {};
}

/**
* Operation to perform flatten operation on a valid scene.
* Returns a list of instances such that entities are fully
* baked into the instance and attributes are merged.
* Transformation matrix is not yet applied to the entity.
* @return {Array}       List of instances of a flattened scene
*/
Flattener.prototype.flatten = function() {
    var primStatus = new StatusMap();
    var data = prep(this.sceneJson, primStatus);
    var errors = primStatus.invalidKeySummary();
    var sceneValidator = new SceneValidator();
    if (utils.isScene(data)) {
        var sceneValid = sceneValidator.validateJSON(data);
        errors += sceneValid.getMessage();
    } else {
        throw new FluxModelingError("Flatten: Not a scene");
    }
    if (errors) {
        throw new FluxModelingError(errors);
    }

    // Create Scene Map
    for(var i = 0; i < data.length; ++i) {
        this.scene[data[i].id] = data[i];
    }

    var layeredInstances = this._getLayeredInstances();
    var flattenedScene = this._flattenInstances(layeredInstances);

    return flattenedScene;
};

/**
 * Add an object, transform pair to the scene results
 * @param  {Object} flattenedScene Container for results
 * @param  {Object} inst           The instance containing the object
 * @param  {Object} item           The geometry object
 */
Flattener.prototype._addPair = function(flattenedScene, inst, item) {
    item = utils.mergeAttributes(inst, item);
    flattenedScene.entities.push(item);
    if (inst.matrix == null) {
        flattenedScene.transforms.push(null);
    } else {
        flattenedScene.transforms.push(inst.matrix);
    }
};

/**
* Flattens a list of instances such that it replaces the
* entity reference (id) of entity in the instance with actual entity.
* It also merges attributes.
* @param  {Array} instances      List of unflattened instances
* @return {Array}                List of flattened instances
*/
Flattener.prototype._flattenInstances = function(instances) {
    var flattenedScene = {entities:[], transforms:[]};
    for (var i = 0; i < instances.length; ++i) {
        var inst = instances[i];
        var entity = this.scene[inst.entity];
        if (entity.primitive === constants.SCENE_PRIMITIVES.geometry) {
            var list = entity.entities;
            for (var j=0;j<list.length;j++) {
                var item = list[j];
                item = utils.mergeAttributes(entity, item);
                item = this._addPair(flattenedScene, inst, item);
            }
        } else {
            this._addPair(flattenedScene, inst, entity);
        }
    }

    return flattenedScene;
};

/**
* Multiplies two 4*4 matrices in given order and returns the resulting matrix.
* @param  {Array} inMat1         4*4 matrix representing affine transform
* @param  {Array} inMat2         4*4 matrix represneting affine transform
* @return {Array}                4*4 matrix result of inMat1 * inMat2
*/
function _matrixMultiply(inMat1, inMat2) {
    var out = mat4.create();
    out = mat4.identity(out);
    mat4.multiply(out, inMat1, inMat2);
    return Array.from(out);
}

/**
* Recursively flattens a group and returns a list of instances.
* @param  {object} inGroup               Group to be flattened
* @return  {Array}                       List of instances of flattened group
*/
Flattener.prototype._flattenGroup = function(inGroup) {
    var groupInstances = [];
    for(var i = 0; i < inGroup.children.length; ++i) {
        var groupChild = inGroup.children[i];
        var node = this.scene[groupChild];
        node = utils.mergeAttributes(inGroup, node);
        if (node.primitive === constants.SCENE_PRIMITIVES.group) {
            groupInstances = groupInstances.concat(this._flattenGroup(node));
        } else {
            if (inGroup.matrix != null) {
                if (node.matrix != null) {
                    node.matrix = _matrixMultiply(inGroup.matrix, node.matrix);
                } else {
                    node.matrix = inGroup.matrix;
                }
            }
            groupInstances.push(node);
        }
    }
    return groupInstances;
};

/**
* Copies layer properites as attribute on the element
* @param {object} layer       Layer element
* @param {object} element     Element on which layer's color is copied to
* @return {object}            Element with layer properties copied
*/
function _copyLayerProperties(layer, element) {
    element = utils.mergeAttributes(layer, element);

    if (layer.color != null || layer.label != null) {
        if (element.attributes == null) {
            element.attributes = {};
        }

        if (layer.color != null) {
            if (element.attributes.materialProperties == null) {
                element.attributes.materialProperties = {};
            }
            element.attributes.materialProperties.color = layer.color;
        }

        if (layer.label != null) {
            element.attributes.label = layer.label;
        }
    }

    return element;
}

/**
* Returns list of layered instances of the scene. Works on the scene member variable
* of Flattener.
* @return {Array}       List of instances from each layer of the scene
*/
Flattener.prototype._getLayeredInstances = function() {
    var sceneInstances = [];
    for(var i in this.scene){
        var obj = this.scene[i];
        if (obj.primitive === constants.SCENE_PRIMITIVES.layer) {
            for(var j = 0; j < obj.elements.length;  ++j) {
                var node = this.scene[obj.elements[j]];
                node = _copyLayerProperties(obj, node);
                if (node.primitive === constants.SCENE_PRIMITIVES.group) {
                    sceneInstances = sceneInstances.concat(this._flattenGroup(node));
                } else {
                   sceneInstances.push(node);
                }
            }
        }
    }
    return sceneInstances;
};
