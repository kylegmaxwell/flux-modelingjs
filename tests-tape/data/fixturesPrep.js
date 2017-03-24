'use strict';

// Should convert revit elements into geometry with attributes
module.exports.revitGeometry = {
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
    "errors":''
};


module.exports.revitCurve = {
    "start": {
        "primitive": "revitElement",
        "fluxId": "42bbaba2-21d4-40bc-be05-754added2ffb-0004f052",
        "familyInfo": {
          "category": "Lines",
          "family": "ModelCurve",
          "type": "",
          "placementType": "Invalid"
        },
        "geometryParameters": {
          "curve": {"primitive": "line","start": [-119.11329176361,-57.3972379236386,0],
          "end": [-155.11329176361,-57.3972379236386,0],"units": {"start": "feet","end": "feet"}
          },
          "geometry": []
        },
        "instanceParameters": {
          "UniqueId": "42bbaba2-21d4-40bc-be05-754added2ffb-0004f052",
          "ElementId": 323666,
          "Detail Line": false,
          "Work Plane": "Level : Level 1",
          "Length": 36,
          "Phase Created": "New Construction",
          "Moves With Nearby Elements": false,
          "Line Style": "Lines",
          "Phase Demolished": null
        },
        "typeParameters": {},
        "customParameters": {},
        "materialInfo": [],
        "units": {
          "instanceParameters/Length": "feet"
        }
      },
    "end":
    [{
        "primitive": "line",
        "start": [ -36.30573132954833, -17.494678119125044, 0 ],
        "end": [ -47.27853132954833, -17.494678119125044, 0 ],
        "units": { "end": "meters", "start": "meters" },
        "id":"42bbaba2-21d4-40bc-be05-754added2ffb-0004f052",
        "attributes": {
            "primitive": "revitElement",
            "fluxId":"42bbaba2-21d4-40bc-be05-754added2ffb-0004f052",
            "familyInfo": {
              "category": "Lines",
              "family": "ModelCurve",
              "type": "",
              "placementType": "Invalid"
            },
            "instanceParameters": {
              "UniqueId": "42bbaba2-21d4-40bc-be05-754added2ffb-0004f052",
              "ElementId": 323666,
              "Detail Line": false,
              "Work Plane": "Level : Level 1",
              "Length": 36,
              "Phase Created": "New Construction",
              "Moves With Nearby Elements": false,
              "Line Style": "Lines"
            },
            "typeParameters": {},
            "customParameters": {},
            "materialInfo": []
        }
      }],
    "errors":''
};

// Should flatten nested listes into simple arrays
module.exports.nesting = {
    "start":[[[{"origin":[0,0,0],"primitive":"sphere","radius":10},]],
        [{"origin":[0,0,0],"dimensions":[1,2,3],"axis":[0,0,1],"reference":[0,1,0],
        "primitive":"block"}]],
    "end": [{"origin":[0,0,0],"primitive":"sphere","radius":10},
        {"origin":[0,0,0],"dimensions":[1,2,3],"axis":[0,0,1],"reference":[0,1,0],
        "primitive":"block"}],
    "errors":''
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
    "errors":''
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
    "errors":''
};

// Should convert legacy material properties to current standard
module.exports.legacyMaterial = {
    "start": {"attributes":{"materialProperties":{"opacity":1,"roughness":0.4}},"vertices":
        [[-1,0,0],[0,1,2],[1,0,0],[0,-1,2]],"faces":[[0,3,1],[1,3,2]],"primitive":"mesh"},
    "end": [{"attributes":{"materialProperties":{"transparency":0,"glossiness":0.6}},"vertices":
        [[-1,0,0],[0,1,2],[1,0,0],[0,-1,2]],"faces":[[0,3,1],[1,3,2]],"primitive":"mesh"}],
    "errors":''
};

// Should remove null values from the list
module.exports.empty = {
    "start": [null,{"origin":[0,0,0],"primitive":"sphere","radius":10},null,undefined],
    "end": [{"origin":[0,0,0],"primitive":"sphere","radius":10}],
    "errors":''
};

// Should triangulate convex polygons and associated attributes
module.exports.triangulate = {
    "start": [{
        "vertices": [ [-1,1,2], [1,1,2], [1,-1,2], [-1,-1,2]],
        "faces": [[0,3,2,1]],
        "uv": [ [0,0],[0,1],[1,1],[1,0] ],
        "primitive":"mesh",
        "id": "3DF1D7DC-61C7-43D1-857D-F6CA76E5862A"
      }],
    "end": [{
        "vertices": [ [-1,1,2], [1,1,2], [1,-1,2], [-1,-1,2]],
        "faces": [[0,3,2],[0,2,1]],
        "uv": [ [0,0],[0,1],[1,1],[1,0] ],
        "primitive":"mesh",
        "id": "3DF1D7DC-61C7-43D1-857D-F6CA76E5862A"
      }],
    "errors":''
};

// Some elements fail schema
module.exports.schemaPartial = {
    "start": [{"origin":[0,0,0],"primitive":"sphere","radius":10},
        {"xorigin":[0,0,0],"primitive":"sphere","radius":10}],
    "end": [{"origin":[0,0,0],"primitive":"sphere","radius":10}],
    "errors":'origin'
};

// Can not allow id in geometryList since it could conflict with scene
module.exports.geometryListIds = {
    "start": [{"entities":[
        {"id":"ball","origin":[0,0,10],"primitive":"sphere","radius":10},
        {"id":"ball","origin":[0,0,-10],"primitive":"sphere","radius":10}],"id":"dataKey0","primitive":"geometryList"},
        {"entity":"dataKey0","id":"stuff","matrix":[1,0,0,-20,0,1,0,0,0,0,1,0,0,0,0,1],"primitive":"instance"},
        {"color":[0.8,0.5,0.3],"elements":["stuff"],"id":"myLayer","primitive":"layer"}],
    "end": [{"entities":[
        {"origin":[0,0,10],"primitive":"sphere","radius":10},
        {"origin":[0,0,-10],"primitive":"sphere","radius":10}],"id":"dataKey0","primitive":"geometryList"},
        {"entity":"dataKey0","id":"stuff","matrix":[1,0,0,-20,0,1,0,0,0,0,1,0,0,0,0,1],"primitive":"instance"},
        {"color":[0.8,0.5,0.3],"elements":["stuff"],"id":"myLayer","primitive":"layer"}],
    "errors":''
};

// Some elements fail schema, but should not error during prep
module.exports.invalidSchema = {
    "start": {"colorx":[[0,1,0],[1,1,1],[0,0,1],[1,0,0]],"facesx":[[0,1,2,3]],"id":"3DF1D7DC",
        "normalx":[[[1,1,1],[1,1,1],[1,1,1],[1,1,1]]],"primitive":"mesh",
        "verticexs":[[-1,1,2],[1,1,2],[1,-1,2],[-1,-1,2]]},
    "end": [],
    "errors":'required property'
};

// Geometry list with units
module.exports.geometryListUnits = {
    "start": [
      {
        "entities": [
          {
            "id": "cda7e0bf-c6cb-4827-9ade-34a94cb6955c",
            "origin": [-1,-2,0],
            "primitive": "circle",
            "radius": 1,
            "units": {"origin": "cm","radius": "cm"}
          }
        ],
        "id": "76ebd857-0706-44ff-a6e4-1b612877f1b5",
        "primitive": "geometryList"
      },
      {
        "entity": "76ebd857-0706-44ff-a6e4-1b612877f1b5",
        "id": "81e4fe14-260a-4767-b9a7-dfc7b0657b0b",
        "matrix": [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],
        "primitive": "instance"
      },
      {
        "color": [1,1,1],
        "elements": ["81e4fe14-260a-4767-b9a7-dfc7b0657b0b"],
        "id": "aad1b5ef-7b53-4f13-b3d2-988b4f75bc2c",
        "label": "0",
        "primitive": "layer",
        "visible": true
      }
    ],
    "end": [
      {
        "entities": [
          {
            "origin": [-0.01,-0.02,0],
            "primitive": "circle",
            "radius": 0.01,
            "units": {"origin": "meters","radius": "meters"}
          }
        ],
        "id": "76ebd857-0706-44ff-a6e4-1b612877f1b5",
        "primitive": "geometryList"
      },
      {
        "entity": "76ebd857-0706-44ff-a6e4-1b612877f1b5",
        "id": "81e4fe14-260a-4767-b9a7-dfc7b0657b0b",
        "matrix": [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],
        "primitive": "instance"
      },
      {
        "elements": ["81e4fe14-260a-4767-b9a7-dfc7b0657b0b"],
        "id": "aad1b5ef-7b53-4f13-b3d2-988b4f75bc2c",
        "label": "0",
        "primitive": "layer",
        "visible": true
      }
    ],
    "errors":''
};

// Some elements fail schema, but should not error during prep
module.exports.cameraLightBox = {
    "start": [
    null,
    {
    "farClip":1000,
    "focalLength":43.4558441227157,
    "id":"9e3e3a10-9174-4b09-b605-045c39e17a24",
    "nearClip":1,
    "primitive":"camera",
    "type":"perspective"
    },
    {
    "entity":"9e3e3a10-9174-4b09-b605-045c39e17a24",
    "id":"faf07eee-dd0a-42fa-9237-c56563021dec",
    "label":"Camera001",
    "matrix":[-0.524658799171448,-0.00588010903447866,-0.851292252540588,-34.5830688476563,-0.851312577724457,0.00362387555651367,0.524646282196045,29.4474449157715,0,0.99997615814209,-0.00690710917115211,3.73735356330872,0,0,0,1],
    "primitive":"instance"
    },
    {
    "color":[0.345098048448563,0.564705908298492,0.882353007793427],
    "elements":["faf07eee-dd0a-42fa-9237-c56563021dec","34b989a5-0f45-4049-a43e-c7221a8e07ee","6ed394d5-cafe-495d-a5a2-378f1a5dd1a8"],
    "id":"34cfec47-81cc-4716-bfb6-265bcebb6185",
    "label":"0","primitive":"layer","visible":true},
    null,
    {
    "axis":[0,0,1],
    "dimensions":[18.5027503967285,13.513204574585,7.62487459182739],
    "id":"87ae3612-a819-4ad0-908b-646903d6561e",
    "origin":[0,0,0],
    "primitive":"block",
    "reference":[1,0,0]
    },
    {
    "entity":"87ae3612-a819-4ad0-908b-646903d6561e",
    "id":"34b989a5-0f45-4049-a43e-c7221a8e07ee",
    "label":"Box001",
    "matrix":[1,0,0,-9.93373107910156,0,1,0,3.98167324066162,0,0,1,3.8124372959137,0,0,0,1],
    "primitive":"instance"
    },
    {
    "color":[1,1,1],
    "coneAngle":43,
    "id":"b6f14fc3-790e-41fb-b90f-91bf40a780a5",
    "intensity":1,
    "primitive":"light",
    "type":"spot"
    },
    {
    "entity":"b6f14fc3-790e-41fb-b90f-91bf40a780a5",
    "id":"6ed394d5-cafe-495d-a5a2-378f1a5dd1a8",
    "label":"Spot001",
    "matrix":[-0.964220345020294,0,-0.265102118253708,-21.0812587738037,-0.265102118253708,0,0.964220345020294,54.2160606384277,0,1,0,0,0,0,0,1],
    "primitive":"instance"
    }
    ],
    "end": [
    {
    "farClip":1000,
    "focalLength":43.4558441227157,
    "id":"9e3e3a10-9174-4b09-b605-045c39e17a24",
    "nearClip":1,
    "primitive":"camera",
    "type":"perspective"
    },
    {
    "entity":"9e3e3a10-9174-4b09-b605-045c39e17a24",
    "id":"faf07eee-dd0a-42fa-9237-c56563021dec",
    "label":"Camera001",
    "matrix":[-0.524658799171448,-0.00588010903447866,-0.851292252540588,-34.5830688476563,-0.851312577724457,0.00362387555651367,0.524646282196045,29.4474449157715,0,0.99997615814209,-0.00690710917115211,3.73735356330872,0,0,0,1],
    "primitive":"instance"
    },
    {
    "color":[0.345098048448563,0.564705908298492,0.882353007793427],
    "elements":["faf07eee-dd0a-42fa-9237-c56563021dec","34b989a5-0f45-4049-a43e-c7221a8e07ee","6ed394d5-cafe-495d-a5a2-378f1a5dd1a8"],
    "id":"34cfec47-81cc-4716-bfb6-265bcebb6185",
    "label":"0","primitive":"layer","visible":true},
    {
    "axis":[0,0,1],
    "dimensions":[18.5027503967285,13.513204574585,7.62487459182739],
    "id":"87ae3612-a819-4ad0-908b-646903d6561e",
    "origin":[0,0,0],
    "primitive":"block",
    "reference":[1,0,0]
    },
    {
    "entity":"87ae3612-a819-4ad0-908b-646903d6561e",
    "id":"34b989a5-0f45-4049-a43e-c7221a8e07ee",
    "label":"Box001",
    "matrix":[1,0,0,-9.93373107910156,0,1,0,3.98167324066162,0,0,1,3.8124372959137,0,0,0,1],
    "primitive":"instance"
    },
    {
    "color":[1,1,1],
    "coneAngle":43,
    "id":"b6f14fc3-790e-41fb-b90f-91bf40a780a5",
    "intensity":1,
    "primitive":"light",
    "type":"spot"
    },
    {
    "entity":"b6f14fc3-790e-41fb-b90f-91bf40a780a5",
    "id":"6ed394d5-cafe-495d-a5a2-378f1a5dd1a8",
    "label":"Spot001",
    "matrix":[-0.964220345020294,0,-0.265102118253708,-21.0812587738037,-0.265102118253708,0,0.964220345020294,54.2160606384277,0,1,0,0,0,0,0,1],
    "primitive":"instance"
    }
    ],
    "errors":''
};

module.exports.missingInstance = {
    "start": [{"entities":[
        {"origin":[0,0,10],"primitive":"sphere","radius":10},
        {"origin":[0,0,-10],"primitive":"sphere","radius":10}],"id":"dataKey0","primitive":"geometryList"},
        {"color":[0.8,0.5,0.3],"elements":["dataKey0"],"id":"myLayer","primitive":"layer"}],
    "end": [{"entities":[
        {"origin":[0,0,10],"primitive":"sphere","radius":10},
        {"origin":[0,0,-10],"primitive":"sphere","radius":10}],"id":"dataKey0","primitive":"geometryList"},
        {"color":[0.8,0.5,0.3],"elements":["dataKey0"],"id":"myLayer","primitive":"layer"}],
    "errors":'layer'
};

module.exports.partiallyValidGeometryList = {
    "start": [
      {
        "entities": [
          {
            "id": "c2405953-5310-4a43-9924-1723688b9aef",
            "primitive": "surface",
            "XcontrolPoints": [
            [[28.0668287970977,-30.1625453044418,0],[19.3554058744491,-20.9840136909839,0]],
            [[30.7470643599625,-38.1194702001336,0],[18.8618445477825,-37.6057972549732,0]]],
            "uDegree": 1,
            "uKnots": [0,0,12.6544194618517,12.6544194618517],
            "units": {"controlPoints": "millimeters"
            },
            "vDegree": 1,
            "vKnots": [0,0,16.6291097666497,16.6291097666497]
          },
          {
            "axis": [0,0,1],
            "id": "42f1b69b-040e-4d2e-b861-6ec38e7d3dff",
            "origin": [-23.0786724264965,10.4469321498074,0],
            "primitive": "circle",
            "radius": 7.16724179452539,
            "units": {"origin": "millimeters","radius": "millimeters"}
          }
        ],
        "id": "81f14551-fe8c-436f-932b-f9d471208b78",
        "primitive": "geometryList",
        "units": {"entities": "millimeters"}
      },
      {
        "entity": "81f14551-fe8c-436f-932b-f9d471208b78",
        "id": "9d840ce1-2e3e-48d0-bf51-5ef3b742f9a3",
        "label": null,
        "matrix": [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],
        "primitive": "instance",
        "units": {"matrix/11": "millimeters","matrix/3": "millimeters","matrix/7": "millimeters"}
      },
      {
        "color": [0,0,0],
        "elements": ["9d840ce1-2e3e-48d0-bf51-5ef3b742f9a3"],
        "id": "ed1ed8d8-e17b-4bad-bcb3-3e241a1f84d5",
        "label": "Default",
        "primitive": "layer",
        "visible": true
      }
    ],
    "end": [
      {
        "entities": [
          {
            "axis": [0,0,1],
            "origin": [-0.0230786724264965,0.010446932149807402,0],
            "primitive": "circle",
            "radius": 0.00716724179452539,
            "units": {"origin": "meters","radius": "meters"}
          }
        ],
        "id": "81f14551-fe8c-436f-932b-f9d471208b78",
        "primitive": "geometryList",
        "units": {"entities": "meters"}
      },
      {
        "entity": "81f14551-fe8c-436f-932b-f9d471208b78",
        "id": "9d840ce1-2e3e-48d0-bf51-5ef3b742f9a3",
        "matrix": [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],
        "primitive": "instance",
        "units": {"matrix/11": "meters","matrix/3": "meters","matrix/7": "meters"}
      },
      {
        "color": [0,0,0],
        "elements": ["9d840ce1-2e3e-48d0-bf51-5ef3b742f9a3"],
        "id": "ed1ed8d8-e17b-4bad-bcb3-3e241a1f84d5",
        "label": "Default",
        "primitive": "layer",
        "visible": true
      }
    ],
    "errors":'controlPoints'
};
