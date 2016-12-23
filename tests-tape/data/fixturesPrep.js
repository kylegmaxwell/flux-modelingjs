'use strict';

// Should convert revit elements into geometry with attributes
module.exports.revit = {
    "start": {"primitive":"revitElement","fluxId":"Id-1",
        "familyInfo":{"category":"Walls","family":"WallFamily-1",
        "type":"WallType-1","placementType":"Invalid"},
        "geometryParameters":{
            "profile":[
                {"units":{"end":"feet","start":"feet"},"end":[20.31,17.82,0],"primitive":"line","start":[-63.18,17.82,0]}],
                "level":"Level-1","structural":true,"flipped":true,
                "geometry": [
                    {
                        "faces": [[0,1,2]],
                        "vertices": [
                            [185.93365522966155,-48.9867499393609, 11.3234889800848443e-23],
                            [185.93365522966155,-48.9867499393609,37.401574803149416],
                            [185.93365522966155,-76.09632999185438,37.401574803149416]
                        ],
                        "primitive": "mesh",
                        "units": {}
                    }
                ]
            },
        "instanceParameters":{},"typeParameters":{},"customParameters":{}
    },
    "end":
    [{
        "faces": [[0,1,2]],
        "vertices": [
            [185.93365522966155,-48.9867499393609, 11.3234889800848443e-23],
            [185.93365522966155,-48.9867499393609,37.401574803149416],
            [185.93365522966155,-76.09632999185438,37.401574803149416]
        ],
        "primitive": "mesh",
        "units": {},
        "id":"Id-1",
        "attributes":{
            "primitive":"revitElement",
            "fluxId":"Id-1",
            "familyInfo":{"category":"Walls","family":"WallFamily-1",
            "type":"WallType-1","placementType":"Invalid"},
            "instanceParameters":{},
            "typeParameters":{},
            "customParameters":{}
        }
    }],
    "succeed":true
};

// Should flatten nested listes into simple arrays
module.exports.nesting = {
    "start":[[[{"origin":[0,0,0],"primitive":"sphere","radius":10},]],
        [{"origin":[0,0,0],"dimensions":[1,2,3],"axis":[0,0,1],"reference":[0,1,0],
        "primitive":"block"}]],
    "end": [{"origin":[0,0,0],"primitive":"sphere","radius":10},
        {"origin":[0,0,0],"dimensions":[1,2,3],"axis":[0,0,1],"reference":[0,1,0],
        "primitive":"block"}],
    "succeed":true
};

// Should flatten container elments into simple arrays
module.exports.containers = {
    "start":{"curves":[{"controlPoints":[[0,0,0],[1,0,0],[1,1,0],[0,1,0]],"degree":3,
        "knots":[0,0,0,1,2,3,3,3],"primitive":"curve"},{"degree":3,"knots":[0,0,0,0,14.1,14.1,14.1,14.1],
        "controlPoints":[[0,0,0],[-3.3,-3.3,0],[-6.6,-6.6,0],[-10,-10,0]],"primitive":"curve"},
        {"start":[1,0,0],"middle":[0,1,0],"end":[-1,0,0],"primitive":"arc"}],"primitive":"polycurve"},
    "end": [{"controlPoints":[[0,0,0],[1,0,0],[1,1,0],[0,1,0]],"degree":3,
        "knots":[0,0,0,1,2,3,3,3],"primitive":"curve"},{"degree":3,"knots":[0,0,0,0,14.1,14.1,14.1,14.1],
        "controlPoints":[[0,0,0],[-3.3,-3.3,0],[-6.6,-6.6,0],[-10,-10,0]],"primitive":"curve"},
        {"start":[1,0,0],"middle":[0,1,0],"end":[-1,0,0],"primitive":"arc"}],
    "succeed":true
};

// Should convert color strings to rgb array
module.exports.colors = {
    "start":[{"attributes":{"materialProperties":{"color":"red"}},"vertices":
        [[-1,0,0],[0,1,2],[1,0,0],[0,-1,2]],"faces":[[0,3,1],[1,3,2]],"primitive":"mesh"},
        {"attributes":{"materialProperties":{"color":"blue"}},"vertices": [[-1,0,0],
        [0,1,0],[1,0,0],[0,-1,0]],"faces":[[0,3,1],[1,3,2]],"primitive":"mesh"}],
    "end": [{"attributes":{"materialProperties":{"color":[1,0,0]}},"vertices":
        [[-1,0,0],[0,1,2],[1,0,0],[0,-1,2]],"faces":[[0,3,1],[1,3,2]],"primitive":"mesh"},
        {"attributes":{"materialProperties":{"color":[0,0,1]}},"vertices": [[-1,0,0],
        [0,1,0],[1,0,0],[0,-1,0]],"faces":[[0,3,1],[1,3,2]],"primitive":"mesh"}],
    "succeed":true
};

// Should convert legacy material properties to current standard
module.exports.colors = {
    "start": {"attributes":{"materialProperties":{"opacity":1,"roughness":0.4}},"vertices":
        [[-1,0,0],[0,1,2],[1,0,0],[0,-1,2]],"faces":[[0,3,1],[1,3,2]],"primitive":"mesh"},
    "end": [{"attributes":{"materialProperties":{"transparency":0,"glossiness":0.6}},"vertices":
        [[-1,0,0],[0,1,2],[1,0,0],[0,-1,2]],"faces":[[0,3,1],[1,3,2]],"primitive":"mesh"}],
    "succeed":true
};

// Should remove null values from the list
module.exports.empty = {
    "start": [null,{"origin":[0,0,0],"primitive":"sphere","radius":10},null,undefined],
    "end": [{"origin":[0,0,0],"primitive":"sphere","radius":10}],
    "succeed":true
};
