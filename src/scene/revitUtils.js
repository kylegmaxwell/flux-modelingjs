/**
 * set of helpers fpr revit elements
 */
'use strict';

/**
* Helper function to extract mesh from geometry
* from a revitElement object.
* @function extractGeom
* @param { object } data The revitElement object to extract geometry.
* @return { Array.<object> } An array of mesh objects.
*/
export function extractGeom (data) {
    // TODO(Jaydeep) check data against Revit Schema here.
    if (!hasRevitGeometry(data)) {
        return data;
    }
    var renderData = data.geometryParameters.geometry;
    if (!renderData || renderData.length === 0) {
        renderData = data.geometryParameters.curve;
    }
    if (!renderData || renderData.length === 0) {
        renderData = data.geometryParameters.profile.curves;
    }

    var renderArr = renderData;
    if (renderData.constructor !== Array) {
        renderArr = [renderData];
    }
    var i;
    // Copy material from revit element to mesh
    if (data.attributes && data.attributes.materialProperties) {
        for(i=0; i < renderArr.length; ++i) {
            if (!renderArr[i].attributes) {
                renderArr[i].attributes = {};
            }
            renderArr[i].attributes.materialProperties = data.attributes.materialProperties;
        }
    }
    var attrs = Object.keys(data);
    var exclude = ['geometryParameters', 'units'];
    // For each mesh in revit geometry
    for(i=0; i < renderArr.length; ++i) {
        // Copy fluxId from revit element to mesh id
        if (i===0) {
            renderArr[i].id = data.fluxId;
        } else {
            renderArr[i].id = data.fluxId+'-'+i;
        }
        // Copy over all the other meta data
        if (!renderArr[i].attributes) {
            renderArr[i].attributes = {};
        }
        for (var j=0;j<attrs.length;j++) {
            if (exclude.indexOf(attrs[j])===-1) {
                renderArr[i].attributes[attrs[j]] = data[attrs[j]];
            }
        }
    }
    return renderArr;
}

/**
 * Check if parameter is an object or non empty array
 * @param  {Object} o Any javascript object
 * @return {Boolean}   True for object with useful contents
 */
function _isNotEmpty(o) {
    return o != null && (o.constructor !== Array || o.length > 0);
}

/**
* Helper function to check if a revit element has
* displayable (mesh) geometry
* from a revitElement object.
* @function hasGeometry
* @param { object } data The revitElement.
* @return { Boolean } True of element has geometry.
*/
export function hasRevitGeometry (data) {
    if (!data || !data.geometryParameters) {
        return false;
    }
    var p = data.geometryParameters;
    if (_isNotEmpty(p.geometry)) {
        return true;
    }
    if (p.profile && _isNotEmpty(p.profile.curves)) {
        return true;
    }
    if (p.curve) {
        return true;
    }
    return false;
}
