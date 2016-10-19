'use strict';

import SceneValidator from './Validator.js';
import * as utils from './utils.js';
import FluxModelingError from '../FluxModelingError.js';
import { mat4 } from 'gl-matrix';
import * as constants from './constants.js';

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
* Tranformation matrix is not yet applied to the entity.
* @return {Array}       List of instances of a flattened scene
*/
Flattener.prototype.flatten = function() {
    var sceneValidator = new SceneValidator();
    var result = sceneValidator.validateJSON(this.sceneJson);

    if (result.getResult() !== true) {
        throw new FluxModelingError(result.getMessage());
    }

    // Create Scene Map
    for(var i = 0; i < this.sceneJson.length; ++i) {
        this.scene[this.sceneJson[i].id] = this.sceneJson[i];
    }

    var layeredInstances = this._getLayeredInstances();
    var flattenedScene = this._flattenInstances(layeredInstances);

    return flattenedScene;
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
        inst.entity = this.scene[inst.entity];
        inst.entity = utils.mergeAttributes(inst, inst.entity);
        flattenedScene.entities.push(inst.entity);
        if (inst.matrix == null) {
            flattenedScene.transforms.push(null);
        } else {
            flattenedScene.transforms.push(inst.matrix);
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
                node = utils.mergeAttributes(obj, node);
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