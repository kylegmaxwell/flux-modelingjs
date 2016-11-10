'use strict';

import FluxModelingError from '../FluxModelingError.js';
import * as entities from '../geometry/entity.js';


/** Creates an axis aligned bounding box as a
* block from given two input points (geometry/Point);
* @param {Object} min      Min point of the bounding box.
* @param {Object} max      Max point of the bounding box.
* @returns {Object}        Block as axis aligned bounding box.
*/
export function convertToBlock(min, max) {
    var center = [
            0.5 * (max.point[0] + min.point[0]),
            0.5 * (max.point[1] + min.point[1]),
            0.5 * (max.point[2] + min.point[2])
        ];

    var dims = [
            Math.abs(max.point[0] - min.point[0]),
            Math.abs(max.point[1] - min.point[1]),
            Math.abs(max.point[2] - min.point[2])
        ];

    var blockAsBoundingBox = entities.block(center, dims);

    if (min.units.point != max.units.point) {
        throw new FluxModelingError("Failed to create block. Input points have different units.");
    }

    if (min.units.point != null) {
        blockAsBoundingBox.units.origin = min.units.point;
        blockAsBoundingBox.units.dimensions = min.units.point;
    }

    return blockAsBoundingBox;
}

/** Calculate axis aligned bounding box of a given mesh
*   @param {Object} inputMesh   Input mesh entity
*   @returns {Object}           Axis aligned bounding box of the mesh.
*/
export default function getMeshBoundingBox(inputMesh) {
    if (inputMesh == null) {
        return inputMesh;
    }

    if (inputMesh.primitive == null || inputMesh.primitive != "mesh") {
        throw new FluxModelingError("Input is not a valid mesh.");
    }

    var bBox = [
            [Number.POSITIVE_INFINITY,Number.POSITIVE_INFINITY,Number.POSITIVE_INFINITY],
            [Number.NEGATIVE_INFINITY,Number.NEGATIVE_INFINITY,Number.NEGATIVE_INFINITY]
        ];

    var vertices = inputMesh.vertices;
    if (vertices.length == 0) {
        bBox = [[0,0,0], [0,0,0]];
    }

    for(var i = 0; i < vertices.length; ++i) {
        for(var j = 0; j < 3; ++j) {
            if (vertices[i][j] < bBox[0][j]) {
                bBox[0][j] = vertices[i][j];
            }
            if (vertices[i][j] > bBox[1][j]) {
                bBox[1][j] = vertices[i][j];
            }
        }
    }

    var minPoint = entities.point(bBox[0]);
    var maxPoint = entities.point(bBox[1]);

    var blockAsBoundingBox = convertToBlock(minPoint, maxPoint);

    // Assign units
    if (inputMesh.units != null) {
        blockAsBoundingBox.units.origin = inputMesh.units.vertices;
        blockAsBoundingBox.units.dimensions = inputMesh.units.vertices;
    }

    return blockAsBoundingBox;
}