var revit = {
    "$schema": "http://json-schema.org/draft-06/schema#",
    "title": "flux revit schema",
    "description": "schema for revit elements in flux.",
    "revitTypes": {
        "revitPrimitive": { "enum": [ "revitElement"] },
        "revitFluxId": { "type": [ "string", "null" ] },
        "revitLevel": { "type": "string" },
        "revitStructuralType": { "enum": [ "Beam", "Column", "Brace", "Footing", "NonStructural" ] },
        "revitPlacementType": { "enum": [ "OneLevelBased", "TwoLevelsBased", "OneLevelBasedHosted", "Invalid" ] },
        "revitParametersMap": {
            "type": "object",
            "additionalProperties": false,
            "patternProperties": {
                ".*" : {"type": [ "string", "number", "boolean", "null" ]}
            }
        },
        "revitMeshGeometry": {
            "type": "array",
            "items": { "$ref": "fluxEntity#/geometry/mesh"}
        },
        "revitMaterial": {
            "type": "object",
            "properties": {
                "name": { "type": "string" },
                "area": { "type": "number" },
                "volume": { "type": "number" },
                "paintMaterial": { "type": "boolean" },
                "instanceParameters": { "$ref": "#/revitTypes/revitParametersMap" }
            },
            "required": [ "name", "area", "volume", "paintMaterial", "instanceParameters" ]
        },
        "revitMaterialInfo": {
            "type": "array",
            "items": { "$ref": "#/revitTypes/revitMaterial" }
        },
        "revitFamilyInfo": {
            "type": "object",
            "properties": {
                "category": { "type": "string" },
                "family": { "type": "string" },
                "type": { "type": "string" },
                "placementType": { "$ref": "#/revitTypes/revitPlacementType" }
            },
            "required": ["category", "family", "type", "placementType"]
        },
        "revitProfile": {
            "type": "array",
                "minItems": 1,
                "items": {
                    "anyOf": [
                        { "$ref": "fluxEntity#/geometry/line" },
                        { "$ref": "fluxEntity#/geometry/curve" },
                        { "$ref": "fluxEntity#/geometry/arc" },
                        { "$ref": "fluxEntity#/geometry/polyline"},
                        { "$ref": "fluxEntity#/geometry/polycurve"}
                    ]
                }
        },
        "revitLocation": {
            "anyOf": [
                    { "$ref": "fluxEntity#/geometry/point" },
                    { "$ref": "fluxEntity#/geometry/line" },
                    { "$ref": "fluxEntity#/geometry/curve" },
                    { "$ref": "fluxEntity#/geometry/arc" }
                ]
        },
        "revitCommon": {
            "type": "object",
            "properties": {
                "fluxId": { "$ref": "#/revitTypes/revitFluxId" },
                "primitive": { "$ref": "#/revitTypes/revitPrimitive" },
                "familyInfo": { "$ref": "#/revitTypes/revitFamilyInfo" },
                "materialInfo": { "$ref": "#/revitTypes/revitMaterialInfo" },
                "units": { "$ref": "fluxEntity#/types/units" },
                "instanceParameters": { "$ref": "#/revitTypes/revitParametersMap" },
                "typeParameters": { "$ref": "#/revitTypes/revitParametersMap" },
                "customParameters": { "$ref": "#/revitTypes/revitParametersMap" }
            },
            "required": [ "fluxId", "primitive", "familyInfo" ]
        }
    },
    "revitWall": {
        "type": "object",
        "allOf": [
            { "$ref": "#/revitTypes/revitCommon" },
            { "properties": {
                "geometryParameters": {
                    "properties": {
                        "flipped": { "type": "boolean" },
                        "level": { "$ref": "#/revitTypes/revitLevel" },
                        "profile": { "$ref": "#/revitTypes/revitProfile"},
                        "structural": { "type": "boolean" },
                        "geometry": { "$ref": "#/revitTypes/revitMeshGeometry"}
                    },
                    "required": [
                        "flipped",
                        "level",
                        "profile",
                        "structural"
                    ]
                }
            },
            "required": ["geometryParameters"]
            }
        ]
    },
    "revitRoom": {
        "type": "object",
         "allOf": [
            { "$ref": "#/revitTypes/revitCommon" },
            { "properties": {
                "geometryParameters": {
                    "properties": {
                        "name": { "type": "string" },
                        "level": { "$ref": "#/revitTypes/revitLevel" },
                        "uv": { "$ref": "fluxEntity#/geometry/point" },
                        "phase": { "type": "string" },
                        "geometry": { "$ref": "#/revitTypes/revitMeshGeometry"}
                    },
                    "required": [
                        "name",
                        "level",
                        "uv"
                    ]
                }
            },
            "required": [ "geometryParameters"]
            }
        ]
    },
    "revitReferencePlane": {
        "type": "object",
         "allOf": [
            { "$ref": "#/revitTypes/revitCommon" },
            { "properties": {
                "geometryParameters": {
                    "properties": {
                        "name": { "type": "string" },
                        "wallClosure": { "type": "boolean" },
                        "bubbleEnd": { "$ref": "fluxEntity#/geometry/point" },
                        "freeEnd": { "$ref": "fluxEntity#/geometry/point" },
                        "thirdPoint": { "$ref": "fluxEntity#/geometry/point" },
                        "cutVector": { "$ref": "fluxEntity#/geometry/vector" }
                    },
                    "required": [
                        "name",
                        "wallClosure",
                        "bubbleEnd",
                        "freeEnd",
                        "cutVector"
                    ]
                }
            },
            "required": [ "geometryParameters" ]
            }
        ]
    },
    "revitModelCurve": {
        "type": "object",
        "allOf": [
            { "$ref": "#/revitTypes/revitCommon" },
            { "properties": {
                "geometryParameters": {
                    "properties": {
                        "curve": {
                            "anyOf": [
                                { "$ref": "fluxEntity#/geometry/line" },
                                { "$ref": "fluxEntity#/geometry/curve" },
                                { "$ref": "fluxEntity#/geometry/arc" }
                            ]
                        }
                    },
                    "required": [
                        "curve"
                    ]
                }
            },
            "required": [ "geometryParameters" ]
            }
        ]
    },
    "revitLevel": {
        "type": "object",
        "allOf": [
            { "$ref": "#/revitTypes/revitCommon" },
            { "properties": {
                "geometryParameters": {
                    "properties": {
                        "name": { "type": "string" },
                        "elevation":  { "$ref": "fluxEntity#/types/distance" }
                    },
                    "required": [
                        "name",
                        "elevation"
                    ]
                }
            },
            "required": [ "geometryParameters" ]
            }
        ]
    },
    "revitGrid": {
        "type": "object",
        "allOf": [
            { "$ref": "#/revitTypes/revitCommon" },
            { "properties": {
                "geometryParameters": {
                    "properties": {
                        "name": { "type": "string" },
                        "curve": {
                            "anyOf": [
                                { "$ref": "#/geometry/line" },
                                { "$ref": "#/geometry/arc" }
                            ]
                        }
                    },
                    "required": [
                        "name",
                        "curve"
                    ]
                }
            },
            "required": [ "geometryParameters" ]
            }
        ]
    },
    "revitFloor":{
        "type": "object",
        "allOf": [
            { "$ref": "#/revitTypes/revitCommon" },
            { "properties": {
                "geometryParameters": {
                    "properties": {
                        "profile": { "$ref": "#/revitTypes/revitProfile" },
                        "structural": { "type": "boolean" },
                        "normal": { "$ref": "fluxEntity#/types/direction" },
                        "level": { "$ref": "#/revitTypes/revitLevel" },
                        "geometry": { "$ref": "#/revitTypes/revitMeshGeometry"}
                    },
                    "required": [
                        "profile",
                        "structural",
                        "level"
                    ]
                }
            },
            "required": [ "geometryParameters" ]
            }
        ]
    },
    "revitOneLevelFamilyInstance": {
        "type": "object",
        "allOf": [
            { "$ref": "#/revitTypes/revitCommon" },
            { "properties": {
                "geometryParameters": {
                    "properties": {
                        "location": { "$ref": "#/revitTypes/revitLocation" },
                        "level": { "$ref": "#/revitTypes/revitLevel" },
                        "structuralType": { "$ref": "#/revitTypes/revitStructuralType" },
                        "faceFlipped": { "type": "boolean" },
                        "handFlipped": { "type": "boolean" },
                        "geometry": { "$ref": "#/revitTypes/revitMeshGeometry"}
                    },
                    "required": [
                        "location",
                        "level",
                        "structuralType",
                        "faceFlipped",
                        "handFlipped"
                    ]
                }
            },
            "required": [ "geometryParameters" ]
            }
        ]
    },
    "revitTwoLevelFamilyInstance": {
        "type": "object",
        "allOf": [
            { "$ref": "#/revitTypes/revitCommon" },
            { "properties": {
                "geometryParameters": {
                    "properties": {
                        "location": { "$ref": "#/revitTypes/revitLocation" },
                        "baseLevel": { "$ref": "#/revitTypes/revitLevel" },
                        "topLevel": { "$ref": "#/revitTypes/revitLevel" },
                        "structuralType": { "$ref": "#/revitTypes/revitStructuralType" },
                        "faceFlipped": { "type": "boolean" },
                        "handFlipped": { "type": "boolean" },
                        "geometry": { "$ref": "#/revitTypes/revitMeshGeometry"}
                    },
                    "required":[
                        "location",
                        "baseLevel",
                        "topLevel",
                        "structuralType",
                        "faceFlipped",
                        "handFlipped"
                    ]
                }
            },
            "required": [ "geometryParameters" ]
            }
        ]
    },
    "revitOneLevelHostedFamilyInstance": {
        "type": "object",
        "allOf": [
            { "$ref": "#/revitTypes/revitCommon" },
            { "properties": {
                "geometryParameters": {
                    "properties": {
                        "location": { "$ref": "#/revitTypes/revitLocation" },
                        "level": { "$ref": "#/revitTypes/revitLevel" },
                        "hostId": { "$ref": "#/revitTypes/revitFluxId" },
                        "structuralType": { "$ref": "#/revitTypes/revitStructuralType" },
                        "faceFlipped": { "type": "boolean" },
                        "handFlipped": { "type": "boolean" },
                        "geometry": { "$ref": "#/revitTypes/revitMeshGeometry"}
                    },
                    "required": [
                        "location",
                        "level",
                        "hostId",
                        "structuralType",
                        "faceFlipped",
                        "handFlipped"
                    ]
                }
            },
            "required": [ "geometryParameters" ]
            }
        ]
    }
};
export default revit;
