/**
 * Utility functions to create scene elements.
 */
'use strict';

import * as utils from './utils.js';
import FluxModelingError from '../FluxModelingError.js';
import colorToArray from './materials.js';
import * as constants from './constants.js';

/**
 * Create an instance primitive
 * @param  {String} childId   Id of child object
 * @param  {String} [label]   User facing name of the child object
 * @param  {Array.<Number>} [matrix]   Transform matrix (16 elements)
 * @return {Object}         Flux JSON for instance
 */
export function instance(childId, label, matrix) {
    if (childId == null || childId.constructor !== String) {
        throw new FluxModelingError('Invalid Id specified for instance child.');
    }
    var inst = {
        "entity": childId,
        "id": utils.generateUUID(),
        "matrix": [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],
        "primitive": constants.SCENE_PRIMITIVES.instance
    };
    if (label != null && label.constructor === String) {
        inst.label = label;
    }
    if (matrix != null && matrix.constructor === Array && matrix.length === 16) {
        inst.matrix = matrix;
    }
    return inst;
}

/**
 * Create a geometryList element
 * @param  {Array.<Object>} elements JSON data of child elements
 * @return {Object}          Geometry list object
 */
export function geometryList(elements) {
    return {
        "entities": elements,
        "id": utils.generateUUID(),
        "primitive": constants.SCENE_PRIMITIVES.geometry
    };
}

/**
 * Create a group primitive
 * @param  {Array.<String>} children    Array of ids
 * @return {Object}                     Group JSON
 */
export function group(children) {
    return {
        primitive: constants.SCENE_PRIMITIVES.group,
        id: utils.generateUUID(),
        children: children
    };
}

/**
 * Create a layer element
 * @param  {Array.<String>} elements The list of child element ids
 * @param  {Array.<Number>} [color]    Red green blue triple
 * @param  {String} [label]    User description of the layer
 * @param  {Boolean} [visible]  Whether the layer is displayed
 * @return {Object}          Layer object
 */
export function layer(elements, color, label, visible) {
    if (elements == null || elements.constructor !== Array) {
        throw new FluxModelingError('Invalid children array for layer.');
    }
    var layer = {
        "elements": elements,
        "id": utils.generateUUID(),
        "label": ""+label,
        "primitive": constants.SCENE_PRIMITIVES.layer,
        "visible": !!visible
    };
    if (color != null) {
        if (color.constructor !== Array) {
            layer.color = colorToArray(color);
        } else {
            layer.color = color;
        }
    }
    return layer;
}
