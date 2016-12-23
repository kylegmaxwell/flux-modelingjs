/**
 * set of helpers fpr revit elements
 */

'use strict';

/**
* Helper function to extract mesh from geometry
* from a revitElement object.
*
* @function extractGeom
*
* @param { object } data The revitElement object to extract geometry.
*
* @return { Array.<object> } An array of mesh objects.
*/
export function extractGeom (data) {
    // TODO(Jaydeep) check data against Revit Schema here.
    if (data.geometryParameters && data.geometryParameters.geometry) {
        var meshData = data.geometryParameters.geometry;
        var meshArr = meshData;
        if (meshData.constructor !== Array) {
            meshArr = [meshData];
        }
        var i;
        // Copy material from revit element to mesh
        if (data.attributes && data.attributes.materialProperties) {
            for(i=0; i < meshArr.length; ++i) {
                if (!meshArr[i].attributes) {
                    meshArr[i].attributes = {};
                }
                meshArr[i].attributes.materialProperties = data.attributes.materialProperties;
            }
        }
        var attrs = Object.keys(data);
        var exclude = ['geometryParameters', 'units'];
        // For each mesh in revit geometry
        for(i=0; i < meshArr.length; ++i) {
            // Copy fluxId from revit element to mesh id
            meshArr[i].id = data.fluxId;
            if (i>0) {
                meshArr[i].id += '-'+i;
            }
            // Copy over all the other meta data
            if (!meshArr[i].attributes) {
                meshArr[i].attributes = {};
            }
            for (var j=0;j<attrs.length;j++) {
                if (exclude.indexOf(attrs[j])===-1) {
                    meshArr[i].attributes[attrs[j]] = data[attrs[j]];
                }
            }
        }
        return meshData;
    }
    return data;
}
