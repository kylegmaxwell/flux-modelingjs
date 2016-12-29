/*
 * A set of fixtures for the parasolid util tests
 */
'use strict';

module.exports.sphere1 = {
    "start": {
        "units":{
            "origin": "km",
            "radius": "in"
        },
        "origin":[0,0,0],
        "primitive":"sphere",
        "radius":10
    },
    "end": [{
        "units":{
            "origin": "meters",
            "radius": "meters"
        },
        "origin":[0,0,0],
        "primitive":"sphere",
        "radius":0.254
    }],
    "succeed":true
};

module.exports.caseSensitiveUnitKeys = {
    "start": {
        "units":{
            "ORIGIN": "km",
            "radius": "in"
        },
        "origin":[0,0,0],
        "primitive":"sphere",
        "radius":10
    },
    "end": [{
        "units":{
            "ORIGIN": "km", // should ignore unmatched units (case sensitive)
            "radius": "meters"
        },
        "origin":[0,0,0],
        "primitive":"sphere",
        "radius":0.254
    }],
    "succeed":true
};

module.exports.sphere = {
    "start": {
        "height": 10,
        "origin": [0,0,0],
        "primitive": "sphere",
        "radius": 60,
        "units": {
            "origin": "m",
            "radius": "shrekles"
        }
    },
    "end": [{
        "height": 10,
        "origin": [0,0,0],
        "primitive": "sphere",
        "radius": 1.8288,
        "units": {
            "origin": "meters",
            "radius": "meters"
        }
    }],
    "succeed":true
};

module.exports.caseSensitiveMeasure = {
    "start": {
        "height": 10,
        "origin": [0,0,0],
        "primitive": "sphere",
        "radius": 60,
        "units": {
            "radius": "Mm"
        }
    },
    "end": [{
        "height": 10,
        "origin": [0,0,0],
        "primitive": "sphere",
        "radius": 60000000,
        "units": {
            "radius": "meters"
        }
    }],
    "succeed":true
};

module.exports.polyline = {
    "start": {
        "units":{
            "points":"foot"
        },
        "points":[[0,0,5],[1,0,5],[2,2,5],[0,1,5]],
        "primitive":"polyline"
    },
    "end": [{
        "units":{
            "points":"meters"
        },
        "points":[[0,0,1.524],[0.3048,0,1.524],[0.6096,0.6096,1.524],[0,0.3048,1.524]],
        "primitive":"polyline"
    }],
    "succeed":true
};

// Aggregate entity with units at top level
module.exports.polysurface = {
    "start": {
        "units":{
            "surfaces/0/controlPoints":"cm"
        },
        "surfaces":[{
            "controlPoints":[[[-8,8,0],[8,8,0]],[[-8,-8,0],[8,-8,0]]],
            "primitive":"surface",
            "uDegree":1,
            "uKnots":[0,0,1,1],
            "vDegree":1,
            "vKnots":[0,0,1,1]
        }, {
            "controlPoints":[[[-20,8,9],[-8,8,0]],[[-20,-8,9],[-8,-8,0]]],
            "primitive":"surface",
            "uDegree":1,
            "uKnots":[0,0,1,1],
            "vDegree":1,
            "vKnots":[0,0,1,1]
        }],
        "primitive":"polysurface"
    },
    "end": [{
            "controlPoints":[[[-0.08,0.08,0],[0.08,0.08,0]],[[-0.08,-0.08,0],[0.08,-0.08,0]]],
            "primitive":"surface",
            "uDegree":1,
            "uKnots":[0,0,1,1],
            "vDegree":1,
            "vKnots":[0,0,1,1]
        }, {
            "controlPoints":[[[-20,8,9],[-8,8,0]],[[-20,-8,9],[-8,-8,0]]],
            "primitive":"surface",
            "uDegree":1,
            "uKnots":[0,0,1,1],
            "vDegree":1,
            "vKnots":[0,0,1,1]
        }],
    "succeed":true
};
module.exports.polysurfaceChild = {
    "start": {
        "surfaces":[{
            "units":{
                "controlPoints":"cm"
            },
            "controlPoints":[[[-8,8,0],[8,8,0]],[[-8,-8,0],[8,-8,0]]],
            "primitive":"surface",
            "uDegree":1,
            "uKnots":[0,0,1,1],
            "vDegree":1,
            "vKnots":[0,0,1,1]
        }],
        "primitive":"polysurface"
    },
    "end": [{
            "units":{
                "controlPoints":"meters"
            },
            "controlPoints":[[[-0.08,0.08,0],[0.08,0.08,0]],[[-0.08,-0.08,0],[0.08,-0.08,0]]],
            "primitive":"surface",
            "uDegree":1,
            "uKnots":[0,0,1,1],
            "vDegree":1,
            "vKnots":[0,0,1,1]
    }],
    "succeed":true
};

// Aggregate entity with units on each child
var polycurve = {
    "start": {
        "curves":[
            { // curve 1
                "units":{
                    "controlPoints":"cm"
                },
                "controlPoints":[[0,0,0],[1,0,0],[1,1,0],[0,1,0]],"degree":3,
                "knots":[0,0,0,1,2,3,3,3],"primitive":"curve"
            },
            { // curve 2
                "units":{
                    "start":"km"
                },
                "start":[1,0,0],"middle":[0,1,0],"end":[-1,0,0],"primitive":"arc"
            }
        ],"primitive":"polycurve"
    },
    "end": [
            { // curve 1
                "units":{
                    "controlPoints":"meters"
                },
                "controlPoints":[[0,0,0],[0.01,0,0],[0.01,0.01,0],[0,0.01,0]],"degree":3,
                "knots":[0,0,0,1,2,3,3,3],"primitive":"curve"
            },
            { // curve 2
                "units":{
                    "start":"meters"
                },
                "start":[1000,0,0],"middle":[0,1,0],"end":[-1,0,0],"primitive":"arc"
            }
        ],
    "succeed":true
};

// Test children of aggregate entity
module.exports.polycurve0 = {
    "start": polycurve.start.curves[0],
    "end": [polycurve.end[0]],
    "succeed": polycurve.succeed
};

module.exports.polycurve1 = {
    "start": polycurve.start.curves[1],
    "end": [polycurve.end[1]],
    "succeed": polycurve.succeed
};

module.exports.mesh = {
    "start": {
        "units":{
            "vertices":"um"
        },
        "vertices": [[-1,0,0],[0,1,2],[1,0,0],[0,-1,2]],
        "faces":[[0,3,1],[1,3,2]], "primitive":"mesh"
    },
    "end": [{
        "units":{
            "vertices":"meters"
        },
        "vertices": [[-0.000001,0,0],[0,0.000001,0.000002],[0.000001,0,0],[0,-0.000001,0.000002]],
        "faces":[[0,3,1],[1,3,2]], "primitive":"mesh"
    }],
    "succeed":true
};

module.exports.badUnitsPath1 = {
    "start": {
        "units":{
            "vertices/x":"mmmm"
        },
        "vertices": [[-1,0,0],[0,1,2],[1,0,0],[0,-1,2]],
        "faces":[[0,3,1],[1,3,2]], "primitive":"mesh"
    },
    "end": [{
        "units":{
            "vertices/x":"mmmm"
        },
        "vertices": [[-1,0,0],[0,1,2],[1,0,0],[0,-1,2]],
        "faces":[[0,3,1],[1,3,2]], "primitive":"mesh"
    }],
    "succeed":true
};

module.exports.badUnitsPath2 = {
    "start": {
        "units":{
            "stuff/thing":"um"
        },
        "vertices": [[-1,0,0],[0,1,2],[1,0,0],[0,-1,2]],
        "faces":[[0,3,1],[1,3,2]], "primitive":"mesh"
    },
    "end": [{
        "units":{
            "stuff/thing":"um"
        },
        "vertices": [[-1,0,0],[0,1,2],[1,0,0],[0,-1,2]],
        "faces":[[0,3,1],[1,3,2]], "primitive":"mesh"
    }],
    "succeed":true
};

module.exports.badUnitsType = {
    "start": {
        "units":{
            "vertices":"not a unit"
        },
        "vertices": [[-1,0,0],[0,1,2],[1,0,0],[0,-1,2]],
        "faces":[[0,3,1],[1,3,2]], "primitive":"mesh"
    },
    "end": [{
        "units":{
            "vertices":"not a unit"
        },
        "vertices": [[-1,0,0],[0,1,2],[1,0,0],[0,-1,2]],
        "faces":[[0,3,1],[1,3,2]], "primitive":"mesh"
    }],
    "succeed":true
};

module.exports.noUnits = {
    "start": {
        "vertices": [[-1,0,0],[0,1,2],[1,0,0],[0,-1,2]],
        "faces":[[0,3,1],[1,3,2]], "primitive":"mesh"
    },
    "end": [{
        "vertices": [[-1,0,0],[0,1,2],[1,0,0],[0,-1,2]],
        "faces":[[0,3,1],[1,3,2]], "primitive":"mesh"
    }],
    "succeed":true
};

module.exports.noSpecificUnits = {
    "start": {
        "units":{
        },
        "vertices": [[-1,0,0],[0,1,2],[1,0,0],[0,-1,2]],
        "faces":[[0,3,1],[1,3,2]], "primitive":"mesh"
    },
    "end": [{
        "units":{
        },
        "vertices": [[-1,0,0],[0,1,2],[1,0,0],[0,-1,2]],
        "faces":[[0,3,1],[1,3,2]], "primitive":"mesh"
    }],
    "succeed":true
};

module.exports.nonLengthUnits = {
    "start": {
        "units":{
            "attributes/energy":"kwh"
        },
        "attributes":{
            "energy":5
        },
        "vertices": [[-1,0,0],[0,1,2],[1,0,0],[0,-1,2]],
        "faces":[[0,3,1],[1,3,2]], "primitive":"mesh"
    },
    "end": [{
        "units":{
            "attributes/energy":"meters"
        },
        "attributes":{
            "energy":5
        },
        "vertices": [[-1,0,0],[0,1,2],[1,0,0],[0,-1,2]],
        "faces":[[0,3,1],[1,3,2]], "primitive":"mesh"
    }],
    "succeed":true
};

// Null units is allowed for legacy due to the first implementation in the plugins
module.exports.nullUnits = {
    "start": {
        "units":null,
        "vertices": [[-1,0,0],[0,1,2],[1,0,0],[0,-1,2]],
        "faces":[[0,3,1],[1,3,2]], "primitive":"mesh"
    },
    "end": [{
        "vertices": [[-1,0,0],[0,1,2],[1,0,0],[0,-1,2]],
        "faces":[[0,3,1],[1,3,2]], "primitive":"mesh"
    }],
    "succeed":true
};

module.exports.zeroValues = {
    "start": [
      {
        "id": "80f092cb-b5ef-4161-bc62-8d15c4cfdf9a",
        "origin": [
          0.387358561192207,0.5363650093916,0],
        "primitive": "circle",
        "radius": 0.07680991575304337,
        "units": {"origin": "meters","radius": "meters"
        }
      },
      {
        "entity": "80f092cb-b5ef-4161-bc62-8d15c4cfdf9a",
        "id": "344767b3-0898-47b8-b4ea-4f5d607b6fd3",
        "matrix": [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],
        "primitive": "instance",
        "units": {"matrix/11": "inches","matrix/3": "inches","matrix/7": "inches"
        }
      },
      {
        "color": [1,1,1],
        "elements": ["344767b3-0898-47b8-b4ea-4f5d607b6fd3"],
        "id": "63aba75c-b9e4-475a-b9c3-9c0131b95a9f",
        "label": "0",
        "primitive": "layer",
        "visible": true
      }
    ],
    "end": [
      {
        "id": "80f092cb-b5ef-4161-bc62-8d15c4cfdf9a",
        "origin": [
          0.387358561192207,0.5363650093916,0],
        "primitive": "circle",
        "radius": 0.07680991575304337,
        "units": {"origin": "meters","radius": "meters"
        }
      },
      {
        "entity": "80f092cb-b5ef-4161-bc62-8d15c4cfdf9a",
        "id": "344767b3-0898-47b8-b4ea-4f5d607b6fd3",
        "matrix": [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],
        "primitive": "instance",
        "units": {"matrix/11": "meters","matrix/3": "meters","matrix/7": "meters"
        }
      },
      {
        // Color is removed due to GI-4404 / LIB3D-1002 (see src/scene/prep.js: _cleanLayerColors)
        "elements": ["344767b3-0898-47b8-b4ea-4f5d607b6fd3"],
        "id": "63aba75c-b9e4-475a-b9c3-9c0131b95a9f",
        "label": "0",
        "primitive": "layer",
        "visible": true
      }],
    "succeed":true
};
