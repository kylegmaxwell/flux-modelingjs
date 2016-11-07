'use strict';

import FluxModelingError from '../FluxModelingError.js';
import * as entities from '../geometry/entity.js';

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

    var center = [
            0.5 * (bBox[0][0] + bBox[1][0]),
            0.5 * (bBox[0][1] + bBox[1][1]),
            0.5 * (bBox[0][2] + bBox[1][2])
        ];

    var dims = [
            Math.abs(bBox[1][0] - bBox[0][0]),
            Math.abs(bBox[1][1] - bBox[0][1]),
            Math.abs(bBox[1][2] - bBox[0][2])
        ];

    var blockAsBoundingBox = entities.block(center, dims);

    return blockAsBoundingBox;
}