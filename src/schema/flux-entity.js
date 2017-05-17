var entity = {
    "$schema": "http://json-schema.org/draft-06/schema#",
    "types": {
        "null": {"type": "null"},
        "brep_format": {
            "enum": [ "x_b", "x_t", "iges", "step", "sat", "sab", "stl", "3dm"]
        },
        "index": {
            "type":    "integer",
            "minimum": 0
        },
        "indexNonzero": {
            "type":    "integer",
            "exclusiveMinimum": 0
        },
        "direction": {
            "type": "array",
            "items": { "type": "number" },
            "minItems": 3,
            "maxItems": 3
        },
        "unitNumber": {
            "type":    "number",
            "minimum": 0,
            "maximum": 1
        },
        "fluxid": {
            "type": "string"
        },
        // Note: Use of fluxDimension is expected to be limited to creation of entities and
        // other applications where unitfulness must be known.
        // Tools that parse json that conforms to this document should not need to
        // consider fluxDimension because units should be embedded in the units property of
        // the primitive, for both required parameters and optional attributes.
        "angle": {
            "type": "number",
            "fluxDimension": "angle"
        },
        "coordinate": {
            "type": "number",
            "fluxDimension": "length"
        },
        "distance": {
            "type":     "number",
            "minimum":  0,
            "fluxDimension": "length"
        },
        "area": {
            "type": "number",
            "minimum": 0,
            "fluxDimension": "area"
        },
        "volume": {
            "type": "number",
            "minimum": 0,
            "fluxDimension": "volume"
        },
        "distanceNonzero": {
            "type":     "number",
            "exclusiveMinimum":  0,
            "fluxDimension": "length"
        },
        "position": {
            "type": "array",
            "items": { "$ref": "#/types/coordinate" },
            "minItems": 3,
            "maxItems": 3
        },
        "dimensions": {
            "type": "array",
            "items": { "$ref": "#/types/distanceNonzero" },
            "minItems": 3,
            "maxItems": 3
        },
        "units": {
            "type": "object",
            "additionalProperties": false,
            "patternProperties": {
                ".*" : {"type": "string" }
            }
        },
        "matrix":{
            "type": "array",
            "items": { "type": "number" },
            "minItems": 16,
            "maxItems": 16
        },
        "color":{
            "type": "array",
            "items": {"type": "number"},
            "minItems": 3,
            "maxItems": 3
        },
        "uv":{
            "type": "array",
            "items": {"type": "number"},
            "minItems": 2,
            "maxItems": 2
        }
    },
    "entities": {
        "empty": { "type": "object", "additionalProperties": false },
        "number": { "type": "number" },
        "affineTransform": {
            "type": "object",
            "properties": {
                "id":           { "$ref": "#/types/fluxid" },
                "primitive":    { "enum": [ "affineTransform" ] },
                "attributes":   { "type":  "object" },
                "units":        { "$ref": "#/types/units" },
                "mat":          { "$ref": "#/types/matrix" }
            },
            "required": [ "primitive", "mat" ],
            "additionalProperties": false
        },
        "massProps": {
            "type": "object",
            "properties": {
                "id":           { "$ref": "#/types/fluxid" },
                "primitive":    { "enum": [ "massProps" ] },
                "attributes":   { "type":  "object" },
                "units":        { "$ref": "#/types/units" },
                "mass":         { "$ref": "#/types/distance" },
                "centerOfMass": { "$ref": "#/types/position" },
                "inertiaTensor":{
                    "type": "array",
                    "items": { "$ref": "#/types/direction" },
                    "minItems": 3,
                    "maxItems": 3
                },
                "volume":       { "$ref": "#/types/volume"   },
                "surfaceArea":  { "$ref": "#/types/area"     },
                "length":       { "$ref": "#/types/distance" },
                "circumference":{ "$ref": "#/types/distance" }
            },
            "required": [ "primitive", "mass", "centerOfMass", "inertiaTensor" ],
            "additionalProperties": false
        }
    },
    "geometry": {
        "brep": {
            "type": "object",
            "properties": {
                "id":           { "$ref": "#/types/fluxid" },
                "primitive":    { "enum": [ "brep" ] },
                "content":      { "type": "string"   },
                "format":       { "$ref": "#/types/brep_format" },
                "isCompressed": { "type": "boolean" },
                "isBase64":     { "type": "boolean" },
                "attributes":   { "type":  "object" }
            },
            "required": [ "primitive", "content", "format" ]
        },
        "vector": {
            "type": "object",
            "properties": {
                "id":           { "$ref": "#/types/fluxid" },
                "primitive":    { "enum": [ "vector" ] },
                "attributes":   { "type":  "object" },
                "units":        { "$ref": "#/types/units" },

                "coords":       { "$ref": "#/types/position" }
            },
            "required": [ "primitive", "coords" ]
        },
        "point": {
            "type": "object",
            "properties": {
                "id":           { "$ref": "#/types/fluxid" },
                "primitive":    { "enum": [ "point" ] },
                "attributes":   { "type":  "object" },
                "units":        { "$ref": "#/types/units" },

                "point":       { "$ref": "#/types/position" }
            },
            "required": [ "primitive", "point" ]
        },
        "plane": {
            "type": "object",
            "properties": {
                "id":           { "$ref": "#/types/fluxid" },
                "primitive":    { "enum": [ "plane" ] },
                "attributes":   { "type":  "object" },
                "units":        { "$ref": "#/types/units" },

                "origin":       { "$ref": "#/types/position"  },
                "normal":       { "$ref": "#/types/direction" }
            },
            "required": [ "primitive", "origin", "normal" ]
        },
        "line": {
            "type": "object",
            "properties": {
                "id":           { "$ref": "#/types/fluxid" },
                "primitive":    { "enum": [ "line" ] },
                "attributes":   { "type":  "object" },
                "units":        { "$ref": "#/types/units" },

                "start":        { "$ref": "#/types/position" },
                "end":          { "$ref": "#/types/position" }
            },
            "required": [ "primitive", "start", "end" ]
        },
        "polyline": {
            "type": "object",
            "properties": {
                "id":           { "$ref": "#/types/fluxid" },
                "primitive":    { "enum": [ "polyline" ] },
                "attributes":   { "type":  "object" },
                "units":        { "$ref": "#/types/units" },

                "points":       {
                    "type": "array",
                    "items": { "$ref": "#/types/position" },
                    "minItems": 2
                }
            },
            "required": [ "primitive", "points" ]
        },
        "circle": {
            "type": "object",
            "properties": {
                "id":           { "$ref": "#/types/fluxid" },
                "primitive":    { "enum": [ "circle" ] },
                "attributes":   { "type":  "object" },
                "units":        { "$ref": "#/types/units" },

                "origin":       { "$ref": "#/types/position" },
                "radius":       { "$ref": "#/types/distanceNonzero" },
                "axis":         { "$ref": "#/types/direction" }
            },
            "required": [ "primitive", "origin", "radius" ]
        },
        "ellipse": {
            "type": "object",
            "properties": {
                "id":           { "$ref": "#/types/fluxid" },
                "primitive":    { "enum": [ "ellipse" ] },
                "attributes":   { "type":  "object" },
                "units":        { "$ref": "#/types/units" },

                "origin":       { "$ref": "#/types/position" },
                "majorRadius":  { "$ref": "#/types/distanceNonzero" },
                "minorRadius":  { "$ref": "#/types/distanceNonzero" },
                "axis":         { "$ref": "#/types/direction" },
                "reference":    { "$ref": "#/types/direction" }
            },
            "required": [ "primitive", "origin", "majorRadius", "minorRadius" ]
        },
        "curve": {
            "type": "object",
            "properties": {
                "id":           { "$ref": "#/types/fluxid" },
                "primitive":    { "enum": [ "curve" ] },
                "attributes":   { "type":  "object" },
                "units":        { "$ref": "#/types/units" },

                "degree":       { "$ref": "#/types/indexNonzero" },
                "controlPoints":{ "type": "array", "items": { "$ref": "#/types/position" }},
                "knots":        { "type": "array", "items": { "type": "number" }},
                "weights":      { "type": "array", "items": { "type": "number" }}
            },
            "required": [ "primitive", "degree", "controlPoints", "knots" ]
        },
        "arc": {
            "type": "object",
            "properties": {
                "id":           { "$ref": "#/types/fluxid" },
                "primitive":    { "enum": [ "arc" ] },
                "attributes":   { "type":  "object" },
                "units":        { "$ref": "#/types/units" },

                "start":        { "$ref": "#/types/position" },
                "middle":       { "$ref": "#/types/position" },
                "end":          { "$ref": "#/types/position" }
            },
            "required": [ "primitive", "start", "middle", "end" ]
        },
        "rectangle": {
            "type": "object",
            "properties": {
                "id":           { "$ref": "#/types/fluxid" },
                "primitive":    { "enum": [ "rectangle" ] },
                "attributes":   { "type":  "object" },
                "units":        { "$ref": "#/types/units" },
                "origin":       { "$ref": "#/types/position" },
                "dimensions":   {
                    "type": "array",
                    "items": { "$ref": "#/types/distanceNonzero" },
                    "minItems": 2,
                    "maxItems": 2,
                    "additionalItems": false
                },
                "axis":         { "$ref": "#/types/direction" },
                "reference":    { "$ref": "#/types/direction" }
            },
            "required": [ "primitive", "origin", "dimensions" ]
        },
        "polycurve": {
            "type": "object",
            "properties": {
                "id":           { "$ref": "#/types/fluxid" },
                "primitive":    { "enum": [ "polycurve" ] },
                "attributes":   { "type":  "object" },
                "curves":       {
                    "type":  "array",
                    "minItems": 1,
                    "items": { "oneOf": [
                        { "$ref": "#/geometry/line" },
                        { "$ref": "#/geometry/polyline" },
                        { "$ref": "#/geometry/curve" },
                        { "$ref": "#/geometry/arc" }
                    ] }
                }
            },
            "required": [ "primitive", "curves" ]
        },
        "surface": {
            "type": "object",
            "properties": {
                "id":           { "$ref": "#/types/fluxid" },
                "primitive":    { "enum": [ "surface" ] },
                "attributes":   { "type":  "object" },
                "units":        { "$ref": "#/types/units" },
                "uDegree":      { "$ref": "#/types/indexNonzero" },
                "vDegree":      { "$ref": "#/types/indexNonzero" },
                "uKnots":       { "type": "array", "items": { "type": "number" }},
                "vKnots":       { "type": "array", "items": { "type": "number" }},
                "controlPoints":{
                    "type": "array",
                    "items": {
                        "type": "array",
                        "items": {
                            "$ref": "#/types/position"
                        }
                    }
                },
                "weights":      { "type": "array", "items": { "type": "number" }}
            },
            "required": [ "primitive", "uDegree", "vDegree", "uKnots", "vKnots", "controlPoints" ]
        },
        "polysurface": {
            "type": "object",
            "properties": {
                "id":           { "$ref": "#/types/fluxid" },
                "primitive":    { "enum": [ "polysurface" ] },
                "attributes":   { "type":  "object" },
                "surfaces": {
                    "type": "array",
                    "items": { "oneOf": [
                        { "$ref": "#/geometry/surface" }
                    ]},
                    "minItems": 1
                }
            },
            "required": [ "primitive", "surfaces" ]
        },
        "block": {
            "type": "object",
            "properties": {
                "id":           { "$ref": "#/types/fluxid" },
                "primitive":    { "enum": [ "block" ] },
                "attributes":   { "type":  "object" },
                "units":        { "$ref": "#/types/units" },
                "origin":       { "$ref": "#/types/position" },
                "dimensions":   { "$ref": "#/types/dimensions" },
                "axis":         { "$ref": "#/types/direction" },
                "reference":    { "$ref": "#/types/direction" }
            },
            "required": [ "primitive", "origin", "dimensions" ]
        },
        "sphere": {
            "type": "object",
            "properties": {
                "id":           { "$ref": "#/types/fluxid" },
                "primitive":    { "enum": [ "sphere" ] },
                "attributes":   { "type":  "object" },
                "units":        { "$ref": "#/types/units" },
                "origin":       { "$ref": "#/types/position" },
                "radius":       { "$ref": "#/types/distanceNonzero" }
            },
            "required": [ "primitive", "origin", "radius" ]
        },
        "mesh": {
            "type": "object",
            "properties": {
                "id":           { "$ref": "#/types/fluxid" },
                "primitive":    { "enum": [ "mesh" ] },
                "attributes":   { "type":  "object" },
                "units":        { "$ref": "#/types/units" },
                "vertices":     {
                    "type":     "array",
                    "items":    { "$ref": "#/types/position" }
                },
                "faces":        {
                    "type":     "array",
                    "items":    {
                        "type":     "array",
                        "items":    { "$ref": "#/types/index" },
                        "minItems": 3
                    }
                },
                // per vertex
                "color":     {
                    "type":     "array",
                    "items":    { "$ref": "#/types/color" }
                },
                // per vertex
                "normal":        {
                    "type":     "array",
                    "items":    { "$ref": "#/types/direction" }
                },
                // per vertex
                "uv":        {
                    "type":     "array",
                    "items":    { "$ref": "#/types/uv" }
                },
                "isSolid": { "type": "boolean" }
            },
            "required": [ "primitive", "vertices", "faces" ]
        }
    },
    "scene":{
        "instance": {
            "type": "object",
            "properties": {
                "attributes":   { "type":  "object" },
                "primitive":    { "enum": [ "instance" ] },
                "id":           { "$ref": "#/types/fluxid" },
                "units":        { "$ref": "#/types/units" },
                "matrix":       { "$ref": "#/types/matrix" },
                "label":        { "type": "string" },
                "material":       { "$ref": "#/types/fluxid" },
                "entity":       { "$ref": "#/types/fluxid" }
            },
            "required": [ "primitive", "id", "entity" ],
            "additionalProperties": false
        },
        "geometryList": {
            "type": "object",
            "properties": {
                "attributes":   { "type":  "object" },
                "primitive":    { "enum": [ "geometryList" ] },
                "id":           { "$ref": "#/types/fluxid" },
                "units":        { "$ref": "#/types/units" },
                "entities":     { "type": "array" }
            },
            "required": [ "primitive", "id", "entities" ],
            "additionalProperties": false
        },
        "group": {
            "type": "object",
            "properties": {
                "attributes":   { "type":  "object" },
                "primitive":    { "enum":[ "group" ] },
                "id":           { "$ref": "#/types/fluxid" },
                "units":        { "$ref": "#/types/units" },
                "matrix":       { "$ref": "#/types/matrix" },
                "label":        { "type": "string" },
                "material":       { "$ref": "#/types/fluxid" },
                "children":     {
                    "type":     "array",
                    "items":    { "$ref": "#/types/fluxid" }
                }
            },
            "required": [ "primitive", "id", "children" ],
            "additionalProperties": true
        },
        "layer": {
            "type": "object",
            "properties": {
                "attributes":   { "type":  "object" },
                "primitive":    { "enum":[ "layer" ] },
                "id":           { "$ref": "#/types/fluxid" },
                "label":        { "type": "string" },
                "color":        { "$ref": "#/types/color" },
                "visible":      { "type": "boolean" },
                "elements": {
                    "type":     "array",
                    "items":    { "$ref": "#/types/fluxid" }
                }
            },
            "required": [ "primitive", "id", "elements" ],
            "additionalProperties": false
        },
        "camera": {
            "type": "object",
            "properties": {
                "attributes":   { "type":  "object" },
                "primitive":    { "enum":[ "camera" ] },
                "id":           { "$ref": "#/types/fluxid" },
                "type":         { "enum":[ "orthographic", "perspective" ]},
                "units":        { "$ref": "#/types/units" },
                "nearClip":     { "$ref": "#/types/distance" },
                "farClip":      { "$ref": "#/types/distance" },
                "focalLength":  { "$ref": "#/types/distance" }
            },
            "required": [ "id", "primitive", "type" ],
            "additionalProperties": false
        },
        "light": {
            "type": "object",
            "properties": {
                "attributes":   { "type":  "object" },
                "primitive":    { "enum":[ "light" ] },
                "id":           { "$ref": "#/types/fluxid" },
                "type":         { "enum": [ "point", "directional", "spot" ]},
                "units":        { "$ref": "#/types/units" },
                "color":        { "$ref": "#/types/color" },
                "intensity":    { "type": "number" },
                "coneAngle":    { "$ref": "#/types/angle" }
            },
            "required": [ "id", "primitive", "type" ],
            "additionalProperties": false
        },
        "material": {
            "type": "object",
            "properties": {
                "attributes":   { "type":  "object" },
                "units":        { "$ref": "#/types/units" },
                "primitive":    { "enum":[ "material" ] },
                "id":           { "$ref": "#/types/fluxid" },
                "color":            { "$ref": "fluxEntity#/types/color" },
                "colorMap":         { "$ref": "#/types/fluxid" },
                "reflectivity":     { "$ref": "fluxEntity#/types/unitNumber" },
                "glossiness":       { "$ref": "fluxEntity#/types/unitNumber" },
                "transparency":     { "$ref": "fluxEntity#/types/unitNumber" },
                "transparencyIOR":      {
                    "type":     "number",
                    "minimum":  0
                },
                "emissionColor":    { "$ref": "fluxEntity#/types/color" },
                "transparencyColor":{ "$ref": "fluxEntity#/types/color" },
                "reflectivityColor":{ "$ref": "fluxEntity#/types/color" },
                "required": [ "id", "primitive" ]
            },
            "additionalProperties": false
        },
        "texture": {
            "type": "object",
            "properties": {
                "attributes":   { "type":  "object" },
                "primitive":    { "enum":[ "texture" ] },
                "id":           { "$ref": "#/types/fluxid" },
                "image":        { "type": "string" },
                "required":     [ "id", "primitive", "image" ]
            },
            "additionalProperties": false
        }
    }
};
export default entity;
