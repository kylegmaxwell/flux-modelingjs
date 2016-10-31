'use strict';


import * as schema from '../schema/index.js';
import FluxModelingError from '../FluxModelingError.js';
import * as types from '../types.js';
import { mat4, vec3, quat } from 'gl-matrix';


//TODO(Jaydeep): Move this out of here an to utils so that
// it can be accessed from other places.
var validEntities = Object.keys(schema.entity.geometry).filter(
    function (el) { return el !== "brep"; });

var refAxisEntities = ["block", "circle", "ellipse", "rectangle"];


/** Transform a given position vector by the given matrix.
*   optionally requested to be normalized.
*   @param {Array}      inputVal    Input vector as array of size 3
*   @param {Array}      matrix      Input affine transform as an array of size 16
*   @returns {Array}                Transformed vector
*/
function _transformPosition(inputVal, matrix) {
    if (inputVal == null) {
        return inputVal;
    }

    if (inputVal[0].constructor == Array) {
        for(var i = 0; i < inputVal.length; ++i) {
            inputVal[i] = _transformPosition(inputVal[i], matrix);
        }
    } else {
        if (inputVal.length === 3) {
            var mat = mat4.create();
            mat4.transpose(mat, matrix);
            var vecTransformed = vec3.create();
            var vec = vec3.fromValues(inputVal[0], inputVal[1], inputVal[2]);
            vec3.transformMat4(vecTransformed, vec, mat);
            inputVal = Array.from(vecTransformed);
        }
    }

    return inputVal;
}

/** Transform a direction vector by the given matrix. Only rotation
*  part of the affine matrix is relevant for transforming a direction.
*   @param {Array}      inputVal    Input vector as array of size 3
*   @param {Array}      matrix      Input affine transform as an array of size 16
*   @returns {Array}                Transformed vector
*/
function _transformDirection(inputVal, matrix) {
    if (inputVal == null) {
        return inputVal;
    }

    if (inputVal[0].constructor == Array) {
        for(var i = 0; i < inputVal.length; ++i) {
            inputVal[i] = _transformDirection(inputVal[i], matrix);
        }
    } else {
        if (inputVal.length === 3) {
            var mat = mat4.create();
            mat4.transpose(mat, matrix);

            // Direction vectors are only rotated.
            // They are not scaled or translated.
            var rotation = quat.create();
            mat4.getRotation(rotation, mat);
            var rotationMatrix = mat4.create();
            mat4.fromRotationTranslation(rotationMatrix, rotation, [0,0,0]);
            var vecTransformed = vec3.create();
            var vec = vec3.fromValues(inputVal[0], inputVal[1], inputVal[2]);
            vec3.transformMat4(vecTransformed, vec, rotationMatrix);
            inputVal = Array.from(vecTransformed);
        }
    }

    return inputVal;
}

/** Extrace scaling vector from a given affine matrix.
*   @param {Array} matrix   Affine matrix as an array
*   @returns {Array}        Scaling vector as array
*/
function _getScaleVector(matrix) {
    var scaleVec = [1,1,1];
    scaleVec[0] = Math.sqrt(matrix[0]*matrix[0] + matrix[4]*matrix[4] + matrix[8]*matrix[8]);
    scaleVec[1] = Math.sqrt(matrix[1]*matrix[1] + matrix[5]*matrix[5] + matrix[9]*matrix[9]);
    scaleVec[2] = Math.sqrt(matrix[2]*matrix[2] + matrix[6]*matrix[6] + matrix[10]*matrix[10]);

    return scaleVec;
}

/** Scale a given input by the given transform.
*   @param {Number|Array}   inputVal    Value to be scaled
*   @param {Array}          matrix      Affine matrix with uniform/non-uniform scaling
*   @returns {Number|Array}              Scaled value(s)
*/
function _scaleDimensions(inputVal, matrix) {
    if (inputVal == null) {
        return inputVal;
    }

    var scaleVec = _getScaleVector(matrix);

    if (inputVal.constructor === Array){
        if (inputVal.length > 3) {
             throw new FluxModelingError("Invalid dimensions. Only 2D/3D supported.");
        }

        for(var i = 0; i < inputVal.length; ++i) {
            inputVal[i] *= scaleVec[i];
        }
    } else {
        inputVal *= scaleVec[0];
    }

    return inputVal;
}

/** Transform given entity by given affine transform
*   @param {Object} entity      Value flux geometry entity (except Brep)
*   @param {Array}  matrix      Affine transform matrix
*   @returns {Object}             Transformed entity
*/
export function transform(entity, matrix) {
    if (entity == null || matrix == null) {
        throw new FluxModelingError("Invalid entity or matrix provided for transform");
    }

    var validPrimitive = validEntities.indexOf(entity.primitive);
    if (validPrimitive == -1) {
        throw new FluxModelingError("Failed to transform " + entity.primitive);
    }

    // Polycurve and polysurface need a special treatment..
    // Transfrom each curve inside a polycurve
    if (entity.primitive === "polycurve") {
        for(var i = 0; i < entity.curves.length; ++i) {
            entity.curves[i] = transform(entity.curves[i], matrix);
        }
        return entity;
    }

    // Transform each surface inside a polysurface
    if (entity.primitive === "polysurface") {
        for(i = 0; i < entity.surfaces.length; ++i) {
            entity.surfaces[i] = transform(entity.surfaces[i], matrix);
        }
        return entity;
    }

    // We need to add axis and reference (optional) properties
    // to allow applying rotation.
    var isRefAxisPrimitive = refAxisEntities.indexOf(entity.primitive);
    if (isRefAxisPrimitive != -1) {
        if (entity.axis == null) {
            entity.axis = [0,0,1];
        }
        if (entity.reference == null) {
            entity.reference = [1,0,0];
        }
    }

    if (matrix.constructor !== Array || matrix.length !== 16) {
        throw new FluxModelingError("Invalid transform");
    }

    var positionFields = types.getPositionFields(entity.primitive);
    var directionFields = types.getDirectionFields(entity.primitive);
    var dimensionFields = types.getDimensionFields(entity.primitive);

    // Transform position Fields
    for(i = 0; i < positionFields.length; ++i) {
        var field = positionFields[i];
        var fieldVal = entity[field];
        entity[field] = _transformPosition(fieldVal, matrix);
    }

    // Transform direction Fields
    for(var j = 0; j < directionFields.length; ++j) {
        field = directionFields[j];
        fieldVal = entity[field];
        entity[field] = _transformDirection(fieldVal, matrix);
    }

    // Apply scaling to analytical geometry dimensions...
    for (var k = 0; k < dimensionFields.length; ++k) {
        field = dimensionFields[k];
        fieldVal = entity[field];
        entity[field] = _scaleDimensions(fieldVal, matrix);
    }

    return entity;
}